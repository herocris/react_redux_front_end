import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { isCancelledError } from '@tanstack/react-query';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('P05: actualización de autorizaciones en la sesión existente', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `live-access-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { store } = await load('/src/store/store.ts');
    const { queryClient: client } = await load('/src/queries/queryClient.ts');
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const { authSlice: { actions: auth } } = await load('/src/modules/auth/slices/authSlice.ts');
    const { refreshAuthorization } = await load('/src/modules/auth/thunks/refreshAuthorization.ts');
    const { startLogout } = await load('/src/modules/auth/thunks/aurthThunks.ts');
    const { getSessionSignal } = await load('/src/api/sessionScope.ts');
    const { sessionMutationOptions } = await load('/src/queries/sessionMutationOptions.ts');
    const { subscribeForbidden } = await load('/src/api/authorizationEvents.ts');
    const { applyAnalysisFilters } = await load('/src/modules/analysisFilters/slices/analysisFiltersSlice.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; client.clear(); });
    const defaults = client.getDefaultOptions();
    client.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, gcTime: Infinity }, mutations: { gcTime: Infinity } });
    const user = (permisos = ['drug.view'], roles = []) => ({ nombre: 'Fixture', correo: 'fixture@example.test', permisos, roles });
    const body = value => ({ user: { name: value.nombre, email: value.correo }, permissions: value.permisos, roles: value.roles });
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const gate = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
    const tick = () => new Promise(resolve => setImmediate(resolve));
    const filters = { start_date: '2026-01-01', end_date: '2026-12-31', drugs: [7], weapons: [], ammunitions: [] };

    await t.test('refresh idéntico (orden/duplicados irrelevantes) conserva caché, filtros y generación', async () => {
        store.dispatch(auth.onLogin(user(['drug.view', 'drug.update'])));
        store.dispatch(applyAnalysisFilters(filters));
        client.setQueryData(['drug'], ['visible']);
        const signal = getSessionSignal(), revision = store.getState().auth.authorizationRevision;
        api.defaults.adapter = async config => reply(config, body(user(['drug.update', 'drug.view', 'drug.view'])));
        await store.dispatch(refreshAuthorization());
        assert.equal(signal.aborted, false);
        assert.equal(store.getState().auth.authorizationRevision, revision);
        assert.deepEqual(client.getQueryData(['drug']), ['visible']);
        assert.deepEqual(store.getState().analysisFilters, filters);
    });

    await t.test('revocación/asignación directa o de rol retira ambas cachés sin cambiar identidad/filtros', async () => {
        for (const next of [user([]), user(['drug.view', 'drug.create']), user(['drug.view'], ['analista'])]) {
            store.dispatch(auth.onLogin(user()));
            store.dispatch(applyAnalysisFilters(filters));
            client.setQueryData(['drug', 'options'], ['old']);
            client.getMutationCache().build(client, { mutationFn: async () => 'old' });
            const signal = getSessionSignal();
            api.defaults.adapter = async config => reply(config, body(next));
            await store.dispatch(refreshAuthorization());
            assert.equal(signal.aborted, true);
            assert.deepEqual(store.getState().auth.user, next);
            assert.equal(store.getState().auth.status, 'authenticated');
            assert.deepEqual(store.getState().analysisFilters, filters);
            assert.equal(client.getQueryCache().getAll().length, 0);
            assert.equal(client.getMutationCache().getAll().length, 0);
        }
    });

    await t.test('lectura y escritura aceptada pendientes no publican ni ejecutan efectos tras revocar', async () => {
        store.dispatch(auth.onLogin(user()));
        const read = gate(), write = gate();
        const pendingRead = client.fetchQuery({ queryKey: ['private'], queryFn: () => read.promise });
        const readRejected = assert.rejects(pendingRead, isCancelledError);
        const effects = [];
        const pendingWrite = client.getMutationCache().build(client, sessionMutationOptions({
            mutationFn: () => write.promise, onSuccess: () => effects.push('success'),
            onError: () => effects.push('error'), onSettled: () => effects.push('settled'),
        })).execute();
        const writeRejected = assert.rejects(pendingWrite, axios.isCancel);
        await tick();
        store.dispatch(auth.onSessionRefreshed(user([])));
        read.resolve('late private data'); write.resolve('server already committed');
        await Promise.all([readRejected, writeRejected]);
        assert.deepEqual(effects, []);
        assert.equal(client.getQueryData(['private']), undefined);
        assert.equal(client.getMutationCache().getAll().length, 0);
    });

    await t.test('403 concurrentes se agrupan y limitan; refresh nunca se autoencadena ni repite escritura', async () => {
        store.dispatch(auth.onLogin(user()));
        const held = gate(); let refreshes = 0, writes = 0;
        api.defaults.adapter = async config => {
            if (config.url === '/refresh') { refreshes++; await held.promise; return reply(config, body(user())); }
            writes++;
            throw new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, undefined, { ...reply(config, { error: 'Denied' }), status: 403 });
        };
        const unsubscribe = subscribeForbidden(() => { void store.dispatch(refreshAuthorization('forbidden')); });
        try {
            await Promise.all([assert.rejects(api.post('/drug')), assert.rejects(api.get('/drug'))]);
            assert.equal(refreshes, 1);
            held.resolve(); await tick();
            await assert.rejects(api.post('/drug'));
            assert.equal(refreshes, 1);
            assert.equal(writes, 3);
            const same = getSessionSignal();
            await store.dispatch(refreshAuthorization('passive'));
            assert.equal(refreshes, 1);
            assert.equal(same.aborted, false);
            await store.dispatch(refreshAuthorization('interval'));
            assert.equal(refreshes, 2, 'Periodic tick must not be postponed by a recent focus check');
            // Refresh errors are excluded at the transport boundary.
            api.defaults.adapter = async config => { throw new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', config,
                undefined, { ...reply(config, {}), status: 403 }); };
            await store.dispatch(refreshAuthorization());
            assert.equal(store.getState().auth.status, 'authenticated');
            assert.notEqual(store.getState().auth.authorizationError, null);
        } finally { unsubscribe(); }
    });

    await t.test('fallo de comprobación cierra acceso y limpia; recuperación conserva filtros, 401 cierra sesión', async () => {
        store.dispatch(auth.onLogin(user())); store.dispatch(applyAnalysisFilters(filters));
        client.setQueryData(['private'], 'old');
        const signal = getSessionSignal();
        api.defaults.adapter = async () => { throw new Error('offline'); };
        await store.dispatch(refreshAuthorization());
        assert.equal(signal.aborted, true);
        assert.equal(store.getState().auth.status, 'authenticated');
        assert.notEqual(store.getState().auth.authorizationError, null);
        assert.equal(client.getQueryData(['private']), undefined);
        api.defaults.adapter = async config => reply(config, body(user()));
        await store.dispatch(refreshAuthorization());
        assert.equal(store.getState().auth.authorizationError, null);
        assert.deepEqual(store.getState().analysisFilters, filters);
        api.defaults.adapter = async config => { throw new axios.AxiosError('401', 'ERR_BAD_REQUEST', config,
            undefined, { ...reply(config, {}), status: 401 }); };
        await store.dispatch(refreshAuthorization());
        assert.equal(store.getState().auth.status, 'not-authenticated');
        assert.deepEqual(store.getState().analysisFilters.drugs, []);
    });

    await t.test('identidad distinta reinicia filtros; refresh antiguo no restaura después de logout/cambio', async () => {
        for (const boundary of [auth.onLogout(), auth.onLogin({ ...user(), correo: 'other@example.test' })]) {
            store.dispatch(auth.onLogin(user()));
            const held = gate();
            api.defaults.adapter = async config => { await held.promise; return reply(config, body(user())); };
            const pending = store.dispatch(refreshAuthorization());
            store.dispatch(boundary);
            const expected = store.getState().auth.user.correo;
            held.resolve(); await pending;
            assert.equal(store.getState().auth.user.correo, expected);
        }
        store.dispatch(auth.onLogin(user())); store.dispatch(applyAnalysisFilters(filters));
        store.dispatch(auth.onSessionRefreshed({ ...user(), correo: 'other@example.test' }));
        assert.deepEqual(store.getState().analysisFilters.drugs, []);
    });

    await t.test('logout pendiente tiene prioridad sobre refresh, incluso ante fallo de logout', async () => {
        for (const fails of [false, true]) {
            store.dispatch(auth.onLogin(user()));
            const refresh = gate(), logout = gate(); let count = 0;
            api.defaults.adapter = async config => {
                if (config.url === '/refresh') { count++; await refresh.promise; return reply(config, body(user([]))); }
                await logout.promise;
                if (fails) throw new Error('logout failed');
                return reply(config, {});
            };
            const pendingRefresh = store.dispatch(refreshAuthorization());
            const pendingLogout = store.dispatch(startLogout());
            const result = fails ? assert.rejects(pendingLogout) : pendingLogout;
            await store.dispatch(refreshAuthorization());
            refresh.resolve(); await pendingRefresh;
            assert.deepEqual(store.getState().auth.user.permisos, ['drug.view']);
            assert.equal(store.getState().auth.authorizationError, null);
            assert.equal(count, 1);
            logout.resolve(); await result;
            assert.equal(store.getState().auth.status, fails ? 'authenticated' : 'not-authenticated');
        }
    });
});
