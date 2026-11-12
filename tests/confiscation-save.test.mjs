import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { QueryObserver, isCancelledError } from '@tanstack/react-query';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('confiscaciones: contratos, consultas anidadas, escrituras y sesión', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', 'confiscation-' + process.pid),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const { createAppQueryClient } = await load('/src/queries/queryClient.ts');
    const { resetSessionScope } = await load('/src/api/sessionScope.ts');
    const original = api.defaults.adapter, env = api.defaults.env;
    api.defaults.env = { ...env, FormData };
    t.after(() => { api.defaults.adapter = original; api.defaults.env = env; });
    const params = { page: 1, sortBy: 'id', orderType: 'asc', per_page: 10, search_by: '', valueSearch: '' };
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const tick = () => new Promise(resolve => setImmediate(resolve));
    for (const domain of ['confiscation', 'drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
        await t.test(domain, async t => {
            const main = domain === 'confiscation';
            const { [domain + 'Service']: service } = await load(`/src/modules/${domain}/services/${domain}Service.ts`);
            const queries = await load(`/src/modules/${domain}/queries/${domain}Queries.ts`);
            const keys = queries[domain + 'Keys'];
            const list = (parent = 7, values = params) => main ? queries.confiscationListOptions(values) : queries[domain + 'ListOptions'](parent, values);
            const key = (parent = 7, values = params) => list(parent, values).queryKey;
            const client = createAppQueryClient();
            const defaults = client.getDefaultOptions();
            client.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, gcTime: Infinity },
                mutations: { ...defaults.mutations, gcTime: Infinity } });
            t.after(() => client.clear());
            const mutation = callback => client.getMutationCache().build(client, main
                ? queries.confiscationMutationOptions(client, callback)
                : queries[domain + 'MutationOptions'](client, 7, callback));
            const item = main
                ? { id: 7, fecha: '2026-11-08', observacion: 'Edición', direccion: 'Dirección', departamento: 'Depto', municipalidad: 'Municipio', latitud: 1.23, longitud: -2.34 }
                : { identificador: 8, decomiso: 7, cantidad: 3, peso: 2.5, droga: 1, presentacion: 2, arma: 3, municion: 4, foto: 'existente.png' };
            const response = main ? { ...item, identificador: 7 } : {
                ...item, decomiso: { identificador: 7 }, droga: { identificador: 1, descripcion: 'Droga' },
                presentacion: { identificador: 2, descripcion: 'Presentación' }, arma: { identificador: 3, descripcion: 'Arma' },
                municion: { identificador: 4, descripcion: 'Munición' },
            };
            if (main) delete response.id;
            const body = (id = 8, page = 1) => ({ data: [{ ...response, identificador: id }], current_page: page, total: 11, last_page: 2, per_page: 10 });
            const intercept = () => {
                const pending = [];
                api.defaults.adapter = config => new Promise(resolve => pending.push({ config, finish: data => resolve(reply(config, data)) }));
                return pending;
            };
            await t.test('listado y detalle: parámetros, cookies, señal y relaciones sin cambiar identificadores', async () => {
                api.defaults.adapter = async config => {
                    assert.equal(config.withCredentials, true);
                    assert.ok(config.signal);
                    assert.match(config.url, /page=2&sort_by=identificador&type=desc&per_page=5&observacion=a/);
                    return reply(config, body(8, 2));
                };
                const p = { ...params, page: 2, per_page: 5, orderType: 'desc', search_by: 'observacion', valueSearch: 'a' };
                const result = await client.fetchQuery(list(7, p));
                assert.equal(main ? result.rows[0].id : result.rows[0].identificador, 8);
                assert.equal(result.tableOptions.total, 11);
                if (!main) {
                    assert.equal(result.rows[0].decomiso, 7);
                    const relation = domain === 'drugConfiscation' ? 'droga' : domain === 'weaponConfiscation' ? 'arma' : 'municion';
                    assert.equal(result.rows[0][relation], item[relation]);
                    assert.equal(typeof result.rows[0][relation + '_nombre'], 'string');
                } else {
                    api.defaults.adapter = async config => {
                        assert.equal(config.url, '/confiscation/7');
                        return reply(config, response);
                    };
                    const detail = await client.fetchQuery(queries.confiscationDetailOptions(7));
                    assert.equal(detail.fecha, item.fecha);
                    assert.equal(detail.latitud, item.latitud);
                    assert.equal(detail.longitud, item.longitud);
                }
            });
            await t.test('crear/editar: JSON o multipart, archivo nuevo/existente y rechazo con causa/reintento', async () => {
                for (const operation of ['create', 'update']) for (const photo of ['existente.png', new File(['imagen'], 'prueba.png')]) {
                    const values = main ? item : { ...item, foto: photo };
                    const snapshot = { ...values };
                    for (const reason of [{ error: { cantidad: ['Revisar'] } }, new axios.AxiosError('Network Error'), null]) {
                        api.defaults.adapter = async () => { throw reason; };
                        await assert.rejects(service[operation](values), error => error === reason);
                        assert.deepEqual(values, snapshot);
                    }
                    api.defaults.adapter = async config => {
                        assert.equal(config.url, '/' + domain + (operation === 'update' ? '/' + (main ? 7 : 8) : ''));
                        assert.equal(config.method, main && operation === 'update' ? 'put' : 'post');
                        assert.equal(config.withCredentials, true);
                        if (main) {
                            assert.deepEqual(JSON.parse(config.data), item);
                        } else {
                            assert.equal(config.data.get('decomiso'), '7');
                            assert.equal(config.data.get('cantidad'), '3');
                            if (operation === 'update') {
                                assert.equal(config.data.get('_method'), 'PUT');
                                assert.equal(config.data.has('foto'), photo instanceof File);
                            }
                            if (photo instanceof File) assert.equal(config.data.get('foto').name, 'prueba.png');
                            if (domain === 'drugConfiscation') assert.equal(config.data.get('peso'), '2.5');
                        }
                        return reply(config, response);
                    };
                    await service[operation](values);
                }
            });
            await t.test('claves incluyen todos los argumentos y padre; caché/deduplicación y coexistencia', async () => {
                client.clear();
                const changes = { page: 2, per_page: 25, sortBy: 'cantidad', orderType: 'desc', search_by: 'cantidad', valueSearch: 3 };
                const hashes = new Set([JSON.stringify(key())]);
                for (const [field, value] of Object.entries(changes)) hashes.add(JSON.stringify(key(7, { ...params, [field]: value })));
                assert.equal(hashes.size, 7);
                if (!main) assert.notDeepEqual(key(7), key(9));
                let calls = 0;
                api.defaults.adapter = async config => {
                    calls++;
                    return reply(config, body(8, Number(new URL(config.url, 'http://test').searchParams.get('page'))));
                };
                await Promise.all([client.fetchQuery(list()), client.fetchQuery(list())]);
                await client.fetchQuery(list());
                assert.equal(calls, 1);
                await client.fetchQuery(list(9, { ...params, page: 2 }));
                assert.equal(calls, 2);
            });
            await t.test('cambios rápidos de padre/argumentos y desmontaje abortan sin publicar respuestas tardías', async () => {
                client.clear();
                const pending = intercept();
                const observer = new QueryObserver(client, list());
                const unsubscribe = observer.subscribe(() => {});
                observer.setOptions(list(9, { ...params, page: 2 }));
                assert.equal(pending[0].config.signal.aborted, true);
                pending[1].finish(body(104, 2)); await tick();
                pending[0].finish(body(103)); await tick();
                const rows = observer.getCurrentResult().data.rows;
                assert.equal(main ? rows[0].id : rows[0].identificador, 104);
                assert.equal(client.getQueryData(key()), undefined);
                observer.setOptions(list(10, { ...params, page: 3 }));
                unsubscribe();
                assert.equal(pending[2].config.signal.aborted, true);
                pending[2].finish(body(105, 3)); await tick();
                assert.equal(client.getQueryData(key(10, { ...params, page: 3 })), undefined);
            });
            await t.test('fallos de escritura conservan caché; solo éxito invalida listas y detalle afectados', async () => {
                for (const write of [{ type: 'create', values: item }, { type: 'update', values: item }, { type: 'delete', id: main ? 7 : 8 }]) {
                    client.clear();
                    const affected = [key(), key(7, { ...params, page: 2 }), ['confiscation', 'detail', 7], ['confiscation', 'list', params]];
                    for (const k of affected) client.setQueryData(k, 'original');
                    client.setQueryData(main ? ['other'] : key(9), 'other-parent');
                    const reason = { error: 'Rechazado' };
                    let effects = 0;
                    const m = mutation(() => effects++);
                    api.defaults.adapter = async () => { throw reason; };
                    await assert.rejects(m.execute(write), error => error === reason);
                    assert.equal(effects, 0);
                    for (const k of affected) assert.equal(client.getQueryState(k).isInvalidated, false);
                    api.defaults.adapter = async config => reply(config, response);
                    await m.execute(write);
                    assert.equal(effects, 1);
                    for (const k of affected) {
                        if (main && write.type === 'delete' && k[1] === 'detail') assert.equal(client.getQueryState(k), undefined);
                        else assert.equal(client.getQueryState(k).isInvalidated, true);
                    }
                    assert.equal(client.getQueryState(main ? ['other'] : key(9)).isInvalidated, false);
                }
            });
            await t.test('éxito espera recarga activa y metadatos antes de cerrar', async () => {
                client.clear();
                let removed = false, effects = 0;
                api.defaults.adapter = async config => {
                    if (config.method === 'delete') { removed = true; return reply(config, {}); }
                    return reply(config, { ...body(), data: removed ? [] : [response], total: removed ? 0 : 1 });
                };
                const observer = new QueryObserver(client, list());
                const unsubscribe = observer.subscribe(() => {});
                try {
                    await tick();
                    await mutation(() => {
                        effects++;
                        assert.equal(observer.getCurrentResult().data.tableOptions.total, 0);
                        assert.deepEqual(observer.getCurrentResult().data.rows, []);
                    }).execute({ type: 'delete', id: main ? 7 : 8 });
                    assert.equal(effects, 1);
                } finally { unsubscribe(); }
            });
            await t.test('sesión retirada: lecturas y escrituras tardías no publican ni invalidan B', async () => {
                client.clear(); resetSessionScope();
                const pending = intercept();
                const read = client.fetchQuery(list());
                const rejectedRead = assert.rejects(read, isCancelledError);
                let effects = 0;
                const old = mutation(() => effects++).execute({ type: 'create', values: item });
                const rejectedWrite = assert.rejects(old, axios.isCancel);
                await tick();
                resetSessionScope(); await client.cancelQueries(); client.clear();
                client.setQueryData(key(), 'B');
                pending[0].finish(body(101)); pending[1].finish(response);
                await Promise.all([rejectedRead, rejectedWrite]);
                assert.equal(effects, 0);
                assert.equal(client.getQueryData(key()), 'B');
                assert.equal(client.getQueryState(key()).isInvalidated, false);
            });
            await t.test('cambio de sesión durante recarga impide cierre posterior al await', async () => {
                client.clear(); resetSessionScope();
                const pending = intercept();
                client.setQueryData(key(), { rows: [item], tableOptions: { total: 1 } });
                const observer = new QueryObserver(client, list());
                const unsubscribe = observer.subscribe(() => {});
                try {
                    let effects = 0;
                    const old = mutation(() => effects++).execute({ type: 'delete', id: main ? 7 : 8 });
                    await tick(); pending[0].finish({}); await tick();
                    assert.equal(pending.length, 2);
                    resetSessionScope(); await client.cancelQueries(); client.clear();
                    pending[1].finish(body(101)); await old;
                    assert.equal(effects, 0);
                } finally { unsubscribe(); }
            });
            if (main) await t.test('borrar padre limpia detalle e hijos propios y conserva otro padre', async () => {
                client.clear(); resetSessionScope();
                for (const child of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
                    client.setQueryData([child, 7, 'list', params], 'old');
                    client.setQueryData([child, 9, 'list', params], 'other');
                }
                api.defaults.adapter = async config => reply(config, {});
                await mutation(() => {}).execute({ type: 'delete', id: 7 });
                for (const child of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
                    assert.equal(client.getQueryData([child, 7, 'list', params]), undefined);
                    assert.equal(client.getQueryData([child, 9, 'list', params]), 'other');
                }
            });
        });
    }
});
