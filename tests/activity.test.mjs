import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryObserver } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('actividad: service y consulta de solo lectura', async t => {
    const server = await createServer({ configFile: false, cacheDir: join(tmpdir(), 'graphdata-tests', `activity-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = p => server.ssrLoadModule(p);
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const { activityService: service } = await load('/src/modules/activity/services/activityService.ts');
    const { activityListOptions: list, activityKeys: keys } = await load('/src/modules/activity/queries/activityQueries.ts');
    const { createAppQueryClient } = await load('/src/queries/queryClient.ts');
    const client = createAppQueryClient(); client.setDefaultOptions({ queries: { retry: false, staleTime: 30000, gcTime: Infinity } });
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; client.clear(); });
    const params = { page: 2, per_page: 5, sortBy: 'id', orderType: 'desc', search_by: 'tipo_de_evento', valueSearch: 'update' };
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const item = { identificador: 7, tipo_de_evento: 'update', descripcion: 'Fixture', id_usuario: 4, usuario: 'Fixture' };
    await t.test('GET preserva parámetros, cookies, campos, JSON de cambios y fechas locales', async () => {
        for (const fecha of ['2026-11-08T12:13:14', '2026-11-08T12:13:14Z', 'sin-fecha']) {
            const changes = [{ antes: 1 }, ['a', 1], 'texto', null, undefined];
            api.defaults.adapter = async config => {
                assert.equal(config.url, '/activity?page=2&sort_by=identificador&type=desc&per_page=5&tipo_de_evento=update');
                assert.equal(config.method, 'get'); assert.equal(config.withCredentials, true);
                return reply(config, { data: changes.map(cambios => ({ ...item, cambios, fecha })), total: 5, current_page: 2 });
            };
            const result = await service.list(params);
            const { identificador: id, ...rest } = item;
            assert.deepEqual(result.rows, changes.map(cambios => ({ id, ...rest, cambios: JSON.stringify(cambios), fecha: dayjs(fecha).format('DD-MM-YYYY HH:mm:ss') })));
            assert.equal(result.tableOptions.current_page, 2);
        }
    });
    await t.test('claves incluyen cada argumento, caché deduplica y fallo de recarga conserva datos', async () => {
        const hashes = new Set([JSON.stringify(keys.list(params))]);
        for (const [field, value] of Object.entries({ page: 3, per_page: 10, sortBy: 'fecha', orderType: 'asc', search_by: '', valueSearch: '' })) hashes.add(JSON.stringify(keys.list({ ...params, [field]: value })));
        assert.equal(hashes.size, 7);
        let calls = 0;
        api.defaults.adapter = async config => { calls++; return reply(config, { data: [], total: 0, current_page: 2 }); };
        await Promise.all([client.fetchQuery(list(params)), client.fetchQuery(list(params))]);
        assert.equal(calls, 1);
        const before = client.getQueryData(keys.list(params));
        const reason = { error: { fecha: ['Temporal'] } };
        api.defaults.adapter = async () => { calls++; throw reason; };
        await assert.rejects(client.fetchQuery({ ...list(params), staleTime: 0 }), error => error === reason);
        assert.equal(calls, 2); assert.deepEqual(client.getQueryData(keys.list(params)), before);
        api.defaults.adapter = async config => reply(config, { data: [], total: 0, current_page: 2 });
        await client.fetchQuery(list(params));
        assert.equal(client.getQueryState(keys.list(params)).error, null);
    });
    await t.test('cambios rápidos/desmontaje abortan sin publicar respuestas tardías', async () => {
        client.clear(); const pending = [];
        api.defaults.adapter = config => new Promise(resolve => pending.push({ config, finish: id => resolve(reply(config, { data: [{ ...item, identificador: id, cambios: {}, fecha: '2026-11-08' }], total: 1 })) }));
        const observer = new QueryObserver(client, list(params)); const off = observer.subscribe(() => {});
        observer.setOptions(list({ ...params, page: 3 }));
        assert.equal(pending[0].config.signal.aborted, true);
        pending[1].finish(104); await new Promise(resolve => setImmediate(resolve));
        pending[0].finish(103); await new Promise(resolve => setImmediate(resolve));
        assert.equal(observer.getCurrentResult().data.rows[0].id, 104);
        observer.setOptions(list({ ...params, page: 4 })); off();
        assert.equal(pending[2].config.signal.aborted, true); pending[2].finish(105);
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(client.getQueryData(keys.list({ ...params, page: 4 })), undefined);
    });
});
