import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { QueryClient } from '@tanstack/react-query';

test('IDs: contrato numérico, relaciones, rutas y una sola clave por recurso', async t => {
    const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { readId, parseRouteId } = await load('/src/api/identifiers.ts');
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const params = { page: 1, per_page: 10, sortBy: 'id', orderType: 'asc', search_by: '', valueSearch: '' };

    await t.test('solo la frontera Router convierte texto; rechaza vacíos, parciales e inseguros', () => {
        assert.equal(parseRouteId('007'), 7);
        for (const value of [undefined, '', ' ', '0', '-1', '1.5', '1e2', '7abc', '9007199254740992'])
            assert.throws(() => parseRouteId(value));
        for (const value of ['7', 0, -1, 1.5, NaN, Infinity, null, {}, Number.MAX_SAFE_INTEGER + 1])
            assert.throws(() => readId(value));
        assert.equal(readId(7), 7);
    });

    await t.test('services validan IDs reales y relaciones, sin aceptar el genérico Axios como validación', async () => {
        for (const [domain, name] of [['drug', 'drug'], ['permission', 'permission'], ['rol', 'role'], ['user', 'user']]) {
            const service = (await load(`/src/modules/${domain}/services/${name}Service.ts`))[name + 'Service'];
            for (const id of ['7', 0, -1, 1.5, null, undefined]) {
                api.defaults.adapter = async config => reply(config, { data: [{ identificador: id }] });
                await assert.rejects(service.list(params));
            }
            api.defaults.adapter = async config => reply(config, { data: [{ identificador: 7, permisos: [2], roles: [3] }] });
            const result = await service.list(params);
            assert.equal((result.rows ?? result.permissions)[0].id, 7);
            if (['rol', 'user'].includes(domain)) {
                api.defaults.adapter = async config => reply(config, { data: [{ identificador: 7, permisos: ['2'] }] });
                await assert.rejects(service.list(params));
            }
        }
        const { drugConfiscationService: child } = await load('/src/modules/drugConfiscation/services/drugConfiscationService.ts');
        for (const id of ['2', 0, null]) {
            api.defaults.adapter = async config => reply(config, { data: [{ identificador: 8,
                decomiso: { identificador: 7 }, droga: { identificador: id }, presentacion: { identificador: 3 } }] });
            await assert.rejects(child.list(7, params));
        }
        const { activityService } = await load('/src/modules/activity/services/activityService.ts');
        api.defaults.adapter = async config => reply(config, { data: [{ identificador: 1,
            id_usuario: null, fecha: '2026-11-11', cambios: {} }] });
        assert.equal((await activityService.list(params)).rows[0].id_usuario, null);
    });

    await t.test('detalle desde lista o URL comparte caché; padres y filtros no aceptan IDs string', async () => {
        const { confiscationKeys: keys, confiscationDetailOptions: detail } = await load('/src/modules/confiscation/queries/confiscationQueries.ts');
        const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity } } });
        t.after(() => client.clear());
        let calls = 0;
        api.defaults.adapter = async config => { calls++; assert.equal(config.url, '/confiscation/7'); return reply(config, { identificador: 7 }); };
        await client.fetchQuery(detail(7));
        await client.fetchQuery(detail(parseRouteId('007')));
        assert.equal(calls, 1);
        assert.deepEqual(keys.detail(7), keys.detail(parseRouteId('7')));
        assert.throws(() => keys.detail('7'));
        for (const domain of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
            const childKeys = (await load(`/src/modules/${domain}/queries/${domain}Queries.ts`))[domain + 'Keys'];
            assert.deepEqual(childKeys.parent(parseRouteId('007')), childKeys.parent(7));
            assert.notDeepEqual(childKeys.parent(7), childKeys.parent(8));
            assert.throws(() => childKeys.parent('7'));
        }
        const { mapKeys } = await load('/src/modules/map/queries/mapQueries.ts');
        assert.throws(() => mapKeys.analysis({ drugs: ['7'], weapons: [], ammunitions: [] }));
    });

    await t.test('sesión usa nombres y rechaza relaciones administrativas', async () => {
        const { authService } = await load('/src/modules/auth/services/authService.ts');
        const session = { user: { name: 'Prueba', email: 'test@example.test' }, roles: ['administrador'], permissions: ['drug.view'] };
        api.defaults.adapter = async config => reply(config, session);
        assert.deepEqual((await authService.checkSession()).roles, ['administrador']);
        api.defaults.adapter = async config => reply(config, { ...session, roles: [1] });
        await assert.rejects(authService.checkSession());
    });
});
