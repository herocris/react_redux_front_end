import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { QueryObserver, isCancelledError } from '@tanstack/react-query';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function catalogQueryTests(domain, name) {
test(domain + ': caché, concurrencia, invalidación y sesión', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', domain + '-query-' + process.pid),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const queries = await load(`/src/modules/${domain}/queries/${name}Queries.ts`);
    const keys = queries[name + 'Keys'], list = queries[name + 'ListOptions'], catalog = queries[name + 'OptionsOptions'], write = queries[name + 'MutationOptions'];
    const { createAppQueryClient } = await load('/src/queries/queryClient.ts');
    const { resetSessionScope } = await load('/src/api/sessionScope.ts');
    const originalEnv = api.defaults.env;
    api.defaults.env = { ...originalEnv, FormData };
    t.after(() => { api.defaults.env = originalEnv; });
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const client = createAppQueryClient();
    const defaults = client.getDefaultOptions();
    client.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, gcTime: Infinity },
        mutations: { ...defaults.mutations, gcTime: Infinity } });
    t.after(() => client.clear());
    const params = { page: 1, sortBy: 'id', orderType: 'asc', per_page: 10, search_by: '', valueSearch: '' };
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const data = (id, page = 1) => ({ data: [{ identificador: id, nombre: id }],
        current_page: page, per_page: 10, total: 1, last_page: 1 });
    const tick = () => new Promise(resolve => setImmediate(resolve));
    const intercept = () => {
        const pending = [];
        api.defaults.adapter = config => new Promise(resolve => pending.push({ config,
            finish: body => resolve(reply(config, body)) }));
        return pending;
    };

    await t.test('cada argumento cambia la clave; catálogo separado y caché vigente sin duplicados', async () => {
        const changes = { page: 2, sortBy: 'nombre', orderType: 'desc', per_page: 25,
            search_by: 'nombre', valueSearch: 'Leer' };
        const hashes = new Set([JSON.stringify(keys.list(params))]);
        for (const [field, value] of Object.entries(changes)) hashes.add(JSON.stringify(keys.list({ ...params, [field]: value })));
        assert.equal(hashes.size, 7);
        assert.notDeepEqual(keys.options(), keys.list(params));
        let calls = 0;
        api.defaults.adapter = async config => { calls++; return reply(config, data(7)); };
        const [a, b] = await Promise.all([client.fetchQuery(list(params)), client.fetchQuery(list(params))]);
        assert.deepEqual(a, b);
        await client.fetchQuery(list(params));
        assert.equal(calls, 1);
    });

    await t.test('cambios rápidos de argumentos y desmontaje abortan; respuestas tardías no sustituyen la clave actual', async () => {
        client.clear();
        const pending = intercept();
        const observer = new QueryObserver(client, list(params));
        const unsubscribe = observer.subscribe(() => {});
        observer.setOptions(list({ ...params, page: 2, valueSearch: 'B' }));
        assert.equal(pending[0].config.signal.aborted, true);
        pending[1].finish(data(102, 2));
        await tick();
        pending[0].finish(data(101));
        await tick();
        assert.equal(observer.getCurrentResult().data.rows[0].id, 102);
        assert.equal(client.getQueryData(keys.list(params)), undefined);
        observer.setOptions(list({ ...params, page: 3 }));
        unsubscribe();
        assert.equal(pending[2].config.signal.aborted, true);
        pending[2].finish(data(105, 3));
        await tick();
        assert.equal(client.getQueryData(keys.list({ ...params, page: 3 })), undefined);
    });

    await t.test('claves independientes coexisten y no cancelan otros consumidores', async () => {
        client.clear();
        const pending = intercept();
        const a = client.fetchQuery(list(params));
        const b = client.fetchQuery(list({ ...params, page: 2 }));
        assert.equal(pending[0].config.signal.aborted, false);
        pending[1].finish(data(102, 2));
        pending[0].finish(data(101));
        await Promise.all([a, b]);
        assert.equal(client.getQueryData(keys.list(params)).rows[0].id, 101);
        assert.equal(client.getQueryData(keys.list({ ...params, page: 2 })).rows[0].id, 102);
    });

    await t.test('errores conservan causa y caché, sin invalidación ni éxito; reintento de las tres escrituras', async () => {
        const reason = { error: { nombre: ['Duplicado'], desconocido: ['General'] } };
        const writes = [{ type: 'create', values: { nombre: 'Nueva', descripcion: 'Nueva', logo: '' } },
            { type: 'update', values: { id: 7, nombre: 'Editada', descripcion: 'Editada', logo: '' } }, { type: 'delete', id: 7 }];
        for (const value of writes) {
            client.clear();
            client.setQueryData(keys.list(params), { rows: [{ id: 7, nombre: 'Original' }] });
            client.setQueryData(keys.options(), [{ id: 7, nombre: 'Original' }]);
            client.setQueryData(keys.list({ ...params, page: 2 }), 'page2');
            client.setQueryData(['other'], 'unchanged');
            let effects = 0;
            api.defaults.adapter = async () => { throw reason; };
            const mutation = client.getMutationCache().build(client, write(client, () => { effects++; }));
            await assert.rejects(mutation.execute(value), error => error === reason);
            assert.equal(effects, 0);
            assert.equal(client.getQueryState(keys.list(params)).isInvalidated, false);
            assert.equal(client.getQueryState(keys.options()).isInvalidated, false);
            assert.equal(client.getQueryData(keys.list(params)).rows[0].nombre, 'Original');
            api.defaults.adapter = async config => reply(config, { identificador: 7, nombre: 'Nueva' });
            await mutation.execute(value);
            assert.equal(effects, 1);
            for (const key of [keys.list(params), keys.list({ ...params, page: 2 }), keys.options()]) {
                assert.equal(client.getQueryState(key).isInvalidated, true);
            }
            assert.equal(client.getQueryState(['other']).isInvalidated, false);
        }
    });

    await t.test('éxito espera recarga de listas y opciones activas; metadatos paginados proceden del servidor', async () => {
        client.clear();
        let removed = false;
        const reads = [];
        api.defaults.adapter = async config => {
            if (config.method === 'delete') { removed = true; return reply(config, {}); }
            reads.push(config.url);
            return reply(config, { data: removed ? [] : [{ identificador: 7, nombre: 'Original' }],
                current_page: 1, per_page: 10, total: removed ? 0 : 1, last_page: 1 });
        };
        const listObserver = new QueryObserver(client, list(params));
        const optionObserver = new QueryObserver(client, catalog());
        const unlist = listObserver.subscribe(() => {});
        const unoption = optionObserver.subscribe(() => {});
        try {
            await tick();
            let effects = 0;
            await client.getMutationCache().build(client, write(client, () => {
                effects++;
                assert.equal(listObserver.getCurrentResult().data.tableOptions.total, 0);
                assert.deepEqual(optionObserver.getCurrentResult().data, []);
            })).execute({ type: 'delete', id: 7 });
            assert.equal(effects, 1);
            assert.equal(reads.length, 4);
        } finally { unlist(); unoption(); }
    });

    await t.test('lectura y escritura tardías de sesión A no invalidan ni publican en B', async () => {
        client.clear(); resetSessionScope();
        const pending = intercept();
        const read = client.fetchQuery(list(params));
        const rejectedRead = assert.rejects(read, isCancelledError);
        let effects = 0;
        const mutation = client.getMutationCache().build(client, write(client, () => { effects++; }));
        const old = mutation.execute({ type: 'create', values: { nombre: 'A', descripcion: 'A', logo: '' } });
        const rejectedWrite = assert.rejects(old, axios.isCancel);
        await tick();
        resetSessionScope();
        await client.cancelQueries(); client.clear();
        client.setQueryData(keys.options(), [{ id: 102, nombre: 'B' }]);
        pending[0].finish(data(101));
        pending[1].finish({ identificador: 101, nombre: 'A' });
        await Promise.all([rejectedRead, rejectedWrite]);
        assert.equal(effects, 0);
        assert.equal(client.getQueryState(keys.options()).isInvalidated, false);
        assert.equal(client.getQueryData(keys.options())[0].id, 102);
    });

    await t.test('cambio de sesión durante la invalidación impide efectos posteriores al await', async () => {
        client.clear(); resetSessionScope();
        const pending = intercept();
        client.setQueryData(keys.list(params), { rows: [{ id: 101, nombre: 'A' }], tableOptions: { total: 1 } });
        const observer = new QueryObserver(client, list(params));
        const unsubscribe = observer.subscribe(() => {});
        let effects = 0;
        const old = client.getMutationCache().build(client, write(client, () => { effects++; }))
            .execute({ type: 'delete', id: 101 });
        await tick(); pending[0].finish({}); await tick();
        assert.equal(pending.length, 2);
        resetSessionScope(); await client.cancelQueries(); client.clear();
        pending[1].finish(data(101));
        await old;
        assert.equal(effects, 0);
        unsubscribe();
    });

});
}
