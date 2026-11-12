import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { QueryObserver } from '@tanstack/react-query';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('P06: paginación vacía por padre en los tres subdecomisos', async t => {
    const server = await createServer({ configFile: false, cacheDir: join(tmpdir(), 'graphdata-tests', 'p06-' + process.pid),
        optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const { createAppQueryClient } = await load('/src/queries/queryClient.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const params = { page: 2, per_page: 2, sortBy: 'id', orderType: 'desc', search_by: 'cantidad', valueSearch: '3' };
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const row = { identificador: 8, decomiso: { identificador: 7 }, cantidad: 3, peso: 1, foto: '',
        droga: { identificador: 1, descripcion: 'D' }, presentacion: { identificador: 2, descripcion: 'P' },
        arma: { identificador: 3, descripcion: 'A' }, municion: { identificador: 4, descripcion: 'M' } };
    for (const domain of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
        await t.test(domain, async t => {
            const { [domain + 'Service']: service } = await load(`/src/modules/${domain}/services/${domain}Service.ts`);
            const queries = await load(`/src/modules/${domain}/queries/${domain}Queries.ts`);
            const list = (parent = 7, p = params) => queries[domain + 'ListOptions'](parent, p);
            const client = createAppQueryClient();
            client.setDefaultOptions({ queries: { retry: false, gcTime: Infinity, staleTime: Infinity }, mutations: { retry: false, gcTime: Infinity } });
            t.after(() => client.clear());
            await t.test('vacío paginado conserva el total positivo del servidor sin sondeo', async () => {
                let calls = 0;
                const metadata = { total: 2, current_page: 2, last_page: 1, per_page: 2 };
                api.defaults.adapter = async config => { calls++; return reply(config, { data: [], ...metadata }); };
                const result = await service.list(7, params);
                assert.deepEqual(result.tableOptions, metadata);
                assert.equal(calls, 1);
            });
            await t.test('solo primera página vacía sin metadatos acredita cero', async () => {
                const calls = [];
                api.defaults.adapter = async config => { calls.push(config.url); return reply(config, { data: [] }); };
                const first = await service.list(7, { ...params, page: 1 });
                assert.equal(first.tableOptions.total, 0);
                assert.equal(first.tableOptions.current_page, 1);
                assert.equal(first.tableOptions.last_page, 1);
                assert.equal(first.tableOptions.per_page, 2);
                calls.length = 0;
                await assert.rejects(service.list(7, params), error => /paginación/.test(error.error));
                assert.equal(calls.length, 1);
            });
            await t.test('fuera de rango conserva padre/filtro/orden/tamaño/señal y total positivo', async () => {
                const calls = [], controller = new AbortController();
                api.defaults.adapter = async config => {
                    calls.push(config);
                    return reply(config, { data: [], total: 2, current_page: 2, last_page: 1, per_page: 2 });
                };
                const result = await service.list(7, params, controller.signal);
                assert.equal(result.tableOptions.total, 2);
                assert.equal(result.tableOptions.last_page, 1);
                assert.equal(result.tableOptions.current_page, 2);
                assert.deepEqual(result.rows, []);
                assert.equal(calls.length, 1);
                for (const config of calls) {
                    assert.equal(config.signal.aborted, false);
                    assert.equal(config.withCredentials, true);
                    assert.match(config.url, new RegExp(`/${domain}/7/confiscation`));
                    assert.match(config.url, /sort_by=identificador&type=desc&per_page=2&cantidad=3/);
                }
                controller.abort();
                assert.equal(calls[0].signal.aborted, true);
            });
            await t.test('metadatos incompletos o inválidos y filas sin total se rechazan; HTTP conserva causa', async () => {
                for (const body of [{ data: [row] }, { data: [], total: 0 },
                    { data: [], total: -1, current_page: 2, last_page: 1, per_page: 2 }]) {
                    api.defaults.adapter = async config => reply(config, body);
                    await assert.rejects(service.list(7, params));
                }
                const reason = { error: 'No disponible' };
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(service.list(7, params), error => error === reason);
            });
            await t.test('borrar última fila recarga total, conserva argumentos y no invalida otro padre', async () => {
                client.clear();
                let removed = false;
                api.defaults.adapter = async config => {
                    if (config.method === 'delete') { removed = true; return reply(config, {}); }
                    const page = Number(new URL(config.url, 'http://test').searchParams.get('page'));
                    return reply(config, { data: removed && page === 2 ? [] : [row], total: removed ? 2 : 3, current_page: page,
                        last_page: removed ? 1 : 2, per_page: 2 });
                };
                const observer = new QueryObserver(client, list());
                const unsubscribe = observer.subscribe(() => {});
                try {
                    await observer.refetch();
                    client.setQueryData(list(9).queryKey, { rows: [], tableOptions: { total: 0 } });
                    let closed = false;
                    const mutation = client.getMutationCache().build(client, queries[domain + 'MutationOptions'](client, 7, () => { closed = true; }));
                    await mutation.execute({ type: 'delete', id: 8 });
                    assert.equal(closed, true);
                    assert.equal(observer.getCurrentResult().data.tableOptions.total, 2);
                    assert.equal(client.getQueryState(list(9).queryKey).isInvalidated, false);
                    observer.setOptions(list(7, { ...params, page: 1 }));
                    await observer.refetch();
                    assert.equal(observer.getCurrentResult().data.tableOptions.current_page, 1);
                    assert.equal(observer.getCurrentResult().data.rows.length, 1);
                } finally { unsubscribe(); }
            });
            await t.test('borrar hijo final normaliza vacío actual sin mezclar otro padre', async () => {
                client.clear();
                let removed = false;
                api.defaults.adapter = async config => {
                    if (config.method === 'delete') { removed = true; return reply(config, {}); }
                    return reply(config, removed ? { data: [] } : { data: [row], total: 1, current_page: 1, last_page: 1, per_page: 2 });
                };
                const options = list(7, { ...params, page: 1 });
                const observer = new QueryObserver(client, options);
                const unsubscribe = observer.subscribe(() => {});
                try {
                    await observer.refetch();
                    client.setQueryData(list(9).queryKey, 'otro padre');
                    const mutation = client.getMutationCache().build(client, queries[domain + 'MutationOptions'](client, 7, () => {}));
                    await mutation.execute({ type: 'delete', id: 8 });
                    assert.deepEqual(observer.getCurrentResult().data.rows, []);
                    assert.equal(observer.getCurrentResult().data.tableOptions.total, 0);
                    assert.equal(client.getQueryData(list(9).queryKey), 'otro padre');
                    assert.equal(client.getQueryState(list(9).queryKey).isInvalidated, false);
                } finally { unsubscribe(); }
            });
            await t.test('vacío ambiguo en recarga publica error sin reemplazar el total acreditado en caché', async () => {
                client.clear();
                let ambiguous = false;
                api.defaults.adapter = async config => reply(config, ambiguous ? { data: [] } : {
                    data: [row], total: 3, current_page: 2, last_page: 2, per_page: 2 });
                const observer = new QueryObserver(client, list());
                const unsubscribe = observer.subscribe(() => {});
                try {
                    await observer.refetch();
                    ambiguous = true;
                    await observer.refetch();
                    assert.equal(observer.getCurrentResult().isError, true);
                    assert.match(observer.getCurrentResult().error.error, /paginación/);
                    assert.equal(client.getQueryData(list().queryKey).tableOptions.total, 3);
                    assert.equal(client.getQueryData(list().queryKey).tableOptions.current_page, 2);
                } finally { unsubscribe(); }
            });
        });
    }
});
