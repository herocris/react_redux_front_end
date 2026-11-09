import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryObserver } from '@tanstack/react-query';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('análisis: contratos, argumentos y concurrencia', async t => {
    const server = await createServer({ configFile: false, cacheDir: join(tmpdir(), `analysis-query-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const { mapQueryOptions } = await load('/src/modules/map/queries/mapQueries.ts');
    const { graphQueryOptions } = await load('/src/modules/graph/queries/graphQueries.ts');
    const { getMapItems } = await load('/src/modules/map/services/mapService.ts');
    const { getGraphData } = await load('/src/modules/graph/services/graphService.ts');
    const { createAppQueryClient } = await load('/src/queries/queryClient.ts');
    const client = createAppQueryClient();
    client.setDefaultOptions({ queries: { ...client.getDefaultOptions().queries, gcTime: Infinity }, mutations: { gcTime: Infinity } });
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; client.clear(); });
    const filters = { start_date: '2026-01-02', end_date: '2026-11-09', drugs: ['7', 2], weapons: [3], ammunitions: ['4'] };
    const args = { filters, period: 1, typeConfiscation: 'Drogas', typeGraph: 'bar' };
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const tick = () => new Promise(resolve => setImmediate(resolve));

    await t.test('services conservan endpoints, parámetros, IDs, señal, respuestas y rechazos', async () => {
        const calls = [];
        const mapItems = [{ id: 8, latitud: 14, longitud: -86 }];
        const graph = { lineBarData: [{ name: 'Enero', Ejemplo: 3 }], pieData: [{ name: 'Ejemplo', value: 3 }] };
        api.defaults.adapter = async config => { calls.push(config); return reply(config, config.url === 'confiscation/map' ? { mapItems } : graph); };
        const signal = new AbortController().signal;
        assert.deepEqual(await getMapItems(filters, signal), mapItems);
        assert.equal(calls[0].signal.aborted, false);
        assert.deepEqual(calls[0].params, { start_date: filters.start_date, end_date: filters.end_date, drugs: '[7,2]', weapons: '[3]', ammunitions: '[4]' });
        for (const [typeConfiscation, endpoint, field, value] of [
            ['Drogas', 'drugGraphIndex', 'drugs', '[7,2]'], ['Armas', 'weaponGraphIndex', 'weapons', '[3]'],
            ['Municiones', 'ammunitionGraphIndex', 'ammunitions', '[4]'],
        ]) {
            assert.deepEqual(await getGraphData({ ...args, typeConfiscation, period: 2, typeGraph: 'pie' }, signal), graph);
            const call = calls.at(-1);
            assert.equal(call.url, endpoint);
            assert.deepEqual(call.params, { start_date: filters.start_date, end_date: filters.end_date, period: 'year', typeGraph: 'pie', [field]: value });
        }
        const failure = { error: 'No disponible' };
        api.defaults.adapter = async () => { throw failure; };
        await assert.rejects(getMapItems(filters), error => error === failure);
        await assert.rejects(getGraphData(args), error => error === failure);
    });

    await t.test('claves completas; defaults sin aplicar no consultan; deduplicación y caché por contexto', async () => {
        let calls = 0;
        api.defaults.adapter = async config => { calls++; return reply(config, { mapItems: [], lineBarData: [], pieData: [] }); };
        const empty = { ...filters, start_date: '', end_date: '' };
        const observer = new QueryObserver(client, mapQueryOptions(empty));
        const stop = observer.subscribe(() => {});
        assert.equal(calls, 0); stop();
        assert.equal(graphQueryOptions({ ...args, filters: empty }).enabled, false);
        assert.equal(graphQueryOptions({ ...args, filters: { ...filters, drugs: [] } }).enabled, false);
        for (const key of ['start_date', 'end_date', 'drugs', 'weapons', 'ammunitions']) {
            const changed = { ...filters, [key]: Array.isArray(filters[key]) ? [99] : '2025-01-01' };
            assert.notDeepEqual(mapQueryOptions(filters).queryKey, mapQueryOptions(changed).queryKey);
            assert.notDeepEqual(graphQueryOptions(args).queryKey, graphQueryOptions({ ...args, filters: changed }).queryKey);
        }
        for (const change of [{ period: 2 }, { typeConfiscation: 'Armas' }, { typeGraph: 'line' }])
            assert.notDeepEqual(graphQueryOptions(args).queryKey, graphQueryOptions({ ...args, ...change }).queryKey);
        await Promise.all([client.fetchQuery(mapQueryOptions(filters)), client.fetchQuery(mapQueryOptions(filters))]);
        await client.fetchQuery(mapQueryOptions(filters));
        assert.equal(calls, 1);
        await client.fetchQuery(graphQueryOptions(args));
        assert.equal(calls, 2);
    });

    await t.test('cambios rápidos y desmontaje cancelan transporte; respuesta tardía no sustituye contexto; error recuperable', async () => {
        for (const [makeOptions, result] of [
            [f => mapQueryOptions(f), id => ({ mapItems: [{ id }] })],
            [f => graphQueryOptions({ ...args, filters: f }), id => ({ lineBarData: [{ name: id }], pieData: [] })],
        ]) {
            client.clear();
            const pending = [];
            api.defaults.adapter = config => new Promise(resolve => pending.push({ config, finish: id => resolve(reply(config, result(id))) }));
            const first = makeOptions(filters), second = makeOptions({ ...filters, drugs: [99] });
            const observer = new QueryObserver(client, first);
            const stop = observer.subscribe(() => {});
            observer.setOptions(second);
            assert.equal(pending[0].config.signal.aborted, true);
            pending[1].finish('B'); await tick();
            pending[0].finish('A'); await tick();
            const expected = result('B');
            assert.deepEqual(observer.getCurrentResult().data, expected.mapItems ?? expected);
            assert.equal(client.getQueryData(first.queryKey), undefined);
            observer.setOptions(makeOptions({ ...filters, drugs: [100] }));
            stop(); assert.equal(pending[2].config.signal.aborted, true);
            pending[2].finish('late'); await tick();
            const failure = { error: 'Error recuperable' };
            api.defaults.adapter = async () => { throw failure; };
            await assert.rejects(client.fetchQuery(first), error => error === failure);
            api.defaults.adapter = async config => reply(config, result('recovered'));
            assert.ok(await client.fetchQuery(first));
        }
    });

    await t.test('escrituras de padre y tres hijos invalidan análisis solo tras éxito', async () => {
        const factories = [];
        const { confiscationMutationOptions } = await load('/src/modules/confiscation/queries/confiscationQueries.ts');
        factories.push(() => confiscationMutationOptions(client, () => {}));
        for (const domain of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
            const module = await load(`/src/modules/${domain}/queries/${domain}Queries.ts`);
            factories.push(() => module[`${domain}MutationOptions`](client, 'parent', () => {}));
        }
        const mapKey = mapQueryOptions(filters).queryKey, graphKey = graphQueryOptions(args).queryKey;
        for (const factory of factories) {
            client.setQueryData(mapKey, []);
            client.setQueryData(graphKey, { lineBarData: [], pieData: [] });
            api.defaults.adapter = async () => { throw { error: 'Falló escritura' }; };
            const failed = client.getMutationCache().build(client, factory());
            await assert.rejects(failed.execute({ type: 'delete', id: 'child' }));
            assert.equal(client.getQueryState(mapKey).isInvalidated, false);
            assert.equal(client.getQueryState(graphKey).isInvalidated, false);
            api.defaults.adapter = async config => reply(config, {});
            const successful = client.getMutationCache().build(client, factory());
            await successful.execute({ type: 'delete', id: 'child' });
            assert.equal(client.getQueryState(mapKey).isInvalidated, true);
            assert.equal(client.getQueryState(graphKey).isInvalidated, true);
        }
    });

    await t.test('lecturas de análisis retiradas por cambio de sesión no publican respuestas tardías', async () => {
        const { store } = await load('/src/store/store.ts');
        const { queryClient } = await load('/src/queries/queryClient.ts');
        queryClient.setDefaultOptions({ queries: { ...queryClient.getDefaultOptions().queries, gcTime: Infinity } });
        const { onLogin, onLogout } = (await load('/src/modules/auth/slices/authSlice.ts')).authSlice.actions;
        const session = nombre => ({ nombre, correo: `${nombre}@example.test`, roles: [], permisos: [] });
        const pending = [];
        api.defaults.adapter = config => new Promise(resolve => pending.push({ config, finish: data => resolve(reply(config, data)) }));
        store.dispatch(onLogin(session('A')));
        const mapOptions = mapQueryOptions(filters), graphOptions = graphQueryOptions(args);
        const reads = [queryClient.fetchQuery(mapOptions), queryClient.fetchQuery(graphOptions)];
        const settled = Promise.allSettled(reads);
        store.dispatch(onLogout()); store.dispatch(onLogin(session('B')));
        assert.ok(pending.every(item => item.config.signal.aborted));
        pending[0].finish({ mapItems: [{ id: 'old' }] });
        pending[1].finish({ lineBarData: [{ name: 'old' }], pieData: [] });
        await settled; await tick();
        assert.equal(queryClient.getQueryData(mapOptions.queryKey), undefined);
        assert.equal(queryClient.getQueryData(graphOptions.queryKey), undefined);
        queryClient.clear();
    });
});
