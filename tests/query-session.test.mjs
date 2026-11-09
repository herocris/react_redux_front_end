import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { QueryObserver, isCancelledError } from '@tanstack/react-query';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('infraestructura Query y aislamiento de sesión durante la convivencia con Redux', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `query-session-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { store, rootReducer } = await load('/src/store/store.ts');
    const { queryClient: client } = await load('/src/queries/queryClient.ts');
    assert.equal(client.getDefaultOptions().queries.staleTime, 30_000);
    assert.equal(client.getDefaultOptions().queries.gcTime, 300_000);
    // Late completions can reschedule GC after cache removal. Avoid keeping
    // Node alive for the browser's retention window; do not change app policy.
    const defaults = client.getDefaultOptions();
    client.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, gcTime: Infinity },
        mutations: { ...defaults.mutations, gcTime: Infinity } });
    const { sessionMutationOptions } = await load('/src/queries/sessionMutationOptions.ts');
    const { default: api } = await load('/src/api/graphdataApi.ts');
    const { authSlice: { actions: auth } } = await load('/src/modules/auth/slices/authSlice.ts');
    const { mapSlice: { actions: role } } = await load('/src/modules/map/slices/mapSlice.ts');
    const roleThunks = await load('/src/modules/map/thunks/mapThunks.ts');
    const authThunks = await load('/src/modules/auth/thunks/aurthThunks.ts');
    const originalAdapter = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = originalAdapter; client.clear(); });
    const session = name => ({ nombre: name, correo: `${name}@example.test`, roles: [], permisos: [] });
    const authResponse = name => ({ user: { name, email: `${name}@example.test` }, roles: [], permissions: [] });
    const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const deferred = () => {
        let resolve, reject;
        const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
        return { promise, resolve, reject };
    };
    const tick = () => new Promise(resolve => setImmediate(resolve));
    const list = () => roleThunks.startLoadingMapItems({ start_date: '2026-01-01', end_date: '2026-12-31', drugs: [], weapons: [], ammunitions: [] });
    const data = id => ({ mapItems: [{ id, nombre: id }] });
    const intercept = () => {
        const pending = [];
        api.defaults.adapter = config => {
            const gate = deferred();
            pending.push({ ...gate, config, finish: data => gate.resolve(reply(config, data)) });
            return gate.promise;
        };
        return pending;
    };

    await t.test('caché por argumentos, vigencia y rechazos HTTP sin reintentos ni pérdida de causa', async () => {
        store.dispatch(auth.onLogin(session('A')));
        let calls = 0;
        const fetchPage = page => client.fetchQuery({ queryKey: ['probe', 'list', { page }],
            queryFn: async () => { calls++; return [page]; } });
        assert.deepEqual(await fetchPage(1), [1]);
        assert.deepEqual(await fetchPage(1), [1]);
        assert.deepEqual(await fetchPage(2), [2]);
        assert.equal(calls, 2);
        const body = { error: 'Sin autorización.' };
        api.defaults.adapter = async config => {
            calls++;
            throw new axios.AxiosError('HTTP error', 'ERR_BAD_REQUEST', config, undefined,
                { ...reply(config, body), status: 403 });
        };
        await assert.rejects(client.fetchQuery({ queryKey: ['probe', 'failure'],
            queryFn: ({ signal }) => api.get('/permission', { signal }) }), error => error === body);
        assert.equal(calls, 3);
        let writes = 0;
        const mutation = client.getMutationCache().build(client, sessionMutationOptions({
            mutationFn: async () => { writes++; throw body; },
        }));
        await assert.rejects(mutation.execute(), error => error === body);
        assert.equal(writes, 1);
    });

    await t.test('claves concurrentes y desmontaje: la señal llega al transporte y no publica la lectura cancelada', async () => {
        store.dispatch(auth.onLogin(session('A')));
        const pending = intercept();
        const first = client.fetchQuery({ queryKey: ['probe', 1], queryFn: ({ signal }) => api.get('/one', { signal }) });
        const second = client.fetchQuery({ queryKey: ['probe', 2], queryFn: ({ signal }) => api.get('/two', { signal }) });
        assert.equal(pending[0].config.signal.aborted, false);
        assert.equal(pending[1].config.signal.aborted, false);
        pending[1].finish('second');
        pending[0].finish('first');
        await Promise.all([first, second]);
        const observer = new QueryObserver(client, { queryKey: ['probe', 'unmount'],
            queryFn: ({ signal }) => api.get('/unmount', { signal }) });
        const unsubscribe = observer.subscribe(() => {});
        unsubscribe();
        assert.equal(pending[2].config.signal.aborted, true);
        pending[2].finish('late');
        await tick();
        assert.equal(client.getQueryData(['probe', 'unmount']), undefined);
    });

    await t.test('logout, cambio de usuario y checking limpian todos los dominios y ambas cachés', async () => {
        for (const boundary of [auth.onLogout(), auth.onLogin(session('B')), auth.onChecking()]) {
            store.dispatch(auth.onLogin(session('A')));
            // Seed every legacy domain, including those without list coverage.
            for (const key of Object.keys(store.getState()).filter(key => key !== 'auth')) {
                store.dispatch({ type: `${key}/onLoading`, payload: true });
            }
            store.dispatch(role.setMapitems([{ id: 'old', nombre: 'old' }]));

            client.setQueryData(['private'], 'old');
            client.getMutationCache().build(client, { mutationKey: ['old'], mutationFn: async () => 'old' });
            store.dispatch(boundary);
            const expected = rootReducer(undefined, { type: 'init' });
            for (const [key, value] of Object.entries(store.getState())) {
                if (key !== 'auth') assert.deepEqual(value, expected[key], key);
            }
            assert.equal(client.getQueryCache().getAll().length, 0);
            assert.equal(client.getMutationCache().getAll().length, 0);
        }
    });

    await t.test('lecturas Query tardías, incluso sin consumir signal, no repueblan una sesión nueva', async () => {
        for (const consumesSignal of [true, false]) {
            store.dispatch(auth.onLogin(session('A')));
            const gate = deferred();
            let signal;
            const pending = client.fetchQuery({ queryKey: ['private'], queryFn: context => {
                if (consumesSignal) signal = context.signal;
                return gate.promise;
            } });
            const rejected = assert.rejects(pending, isCancelledError);
            store.dispatch(auth.onLogin(session('B')));
            if (consumesSignal) assert.equal(signal.aborted, true);
            client.setQueryData(['private'], 'B');
            gate.resolve('A');
            await rejected;
            assert.equal(client.getQueryData(['private']), 'B');
        }
    });

    await t.test('mutaciones tardías no ejecutan callbacks ni invalidan datos nuevos; éxito y fallo actuales sí', async () => {
        for (const fails of [false, true]) {
            store.dispatch(auth.onLogin(session('A')));
            const gate = deferred();
            const callbacks = [];
            const options = sessionMutationOptions({ mutationFn: () => gate.promise,
                onSuccess: () => { callbacks.push('success'); client.setQueryData(['private'], 'old'); },
                onError: () => callbacks.push('error'), onSettled: () => callbacks.push('settled') });
            const pending = client.getMutationCache().build(client, options).execute();
            const rejected = assert.rejects(pending);
            await tick();
            store.dispatch(auth.onLogin(session('B')));
            client.setQueryData(['private'], 'B');
            if (fails) gate.reject({ error: 'old error' });
            else gate.resolve('old result');
            await rejected;
            assert.deepEqual(callbacks, []);
            assert.equal(client.getQueryData(['private']), 'B');
            assert.equal(client.getMutationCache().getAll().length, 0);
            await assert.rejects(client.getMutationCache().build(client, options).execute(), axios.isCancel);
        }
        const callbacks = [];
        const cause = { error: 'actual' };
        for (const fails of [false, true]) {
            const mutation = client.getMutationCache().build(client, sessionMutationOptions({
                mutationFn: async () => { if (fails) throw cause; return 'ok'; },
                onSuccess: () => callbacks.push('success'), onError: () => callbacks.push('error'),
                onSettled: () => callbacks.push('settled'),
            }));
            if (fails) await assert.rejects(mutation.execute(), error => error === cause);
            else assert.equal(await mutation.execute(), 'ok');
        }
        assert.deepEqual(callbacks, ['success', 'settled', 'error', 'settled']);
    });

    await t.test('módulos antiguos: listado, opciones y escritura pendientes se abortan sin tocar la sesión nueva', async () => {
        store.dispatch(auth.onLogin(session('A')));
        const pending = intercept();
        const read = store.dispatch(list(1));
        const rejectedRead = assert.rejects(read);
        const write = store.dispatch(async dispatch => { await api.post('/legacy-write', { nombre: 'A' }); dispatch(role.setMapitems([{ id: 'A' }])); });
        const rejected = assert.rejects(write, axios.isCancel);
        store.dispatch(auth.onLogout());
        store.dispatch(auth.onLogin(session('B')));
        const current = store.dispatch(list(1));
        assert.equal(store.getState().map.loading, true);
        pending.slice(0, 2).forEach(request => assert.equal(request.config.signal.aborted, true));
        pending[0].finish(data('A'));
        pending[1].finish(data('A'));
        pending[1].finish({ identificador: 'A', nombre: 'A' });
        await Promise.all([rejectedRead, rejected]);
        assert.equal(store.getState().map.loading, true);
        assert.deepEqual(store.getState().map.Mapitems, []);
        pending[2].finish(data('B'));
        await current;
        assert.equal(store.getState().map.Mapitems[0].id, 'B');
    });

    await t.test('dispatch tardío y thunks anidados quedan bloqueados aun cuando el trabajo ignora cancelación', async () => {
        store.dispatch(auth.onLogin(session('A')));
        const gate = deferred();
        const pending = store.dispatch(async dispatch => {
            await gate.promise;
            dispatch(role.setMapitems([{ id: 'A', nombre: 'A' }]));
            dispatch(inner => inner(auth.onLogin(session('A'))));
        });
        store.dispatch(auth.onLogin(session('B')));
        gate.resolve();
        await pending;
        assert.equal(store.getState().auth.user.nombre, 'B');
        assert.deepEqual(store.getState().map.Mapitems, []);
    });

    await t.test('refresh y login antiguos no restauran sesión tras logout o un acceso más reciente', async () => {
        const credentials = { email: 'B@example.test', password: 'test-password' };
        for (const oldRequest of [() => authThunks.checkAuthToken(),
            () => authThunks.startLoginWithEmailPassword(credentials)]) {
            store.dispatch(auth.onLogout());
            const pending = intercept();
            const old = store.dispatch(oldRequest());
            const current = store.dispatch(authThunks.startLoginWithEmailPassword(credentials));
            assert.equal(pending[0].config.signal.aborted, true);
            pending[1].finish(authResponse('B'));
            await current;
            pending[0].finish(authResponse('A'));
            await old;
            assert.equal(store.getState().auth.user.nombre, 'B');
            const beforeLogout = store.dispatch(oldRequest());
            const logout = store.dispatch(authThunks.startLogout());
            pending[3].finish({});
            await logout;
            pending[2].finish(authResponse('A'));
            await beforeLogout;
            assert.equal(store.getState().auth.status, 'not-authenticated');
        }
    });

    await t.test('logout fallido conserva sesión y caché; una respuesta antigua de logout no expulsa al usuario nuevo', async () => {
        store.dispatch(auth.onLogin(session('A')));
        client.setQueryData(['private'], 'A');
        const cause = { error: 'Salida rechazada.' };
        api.defaults.adapter = async () => { throw cause; };
        await assert.rejects(store.dispatch(authThunks.startLogout()), error => error === cause);
        assert.equal(store.getState().auth.user.nombre, 'A');
        assert.equal(client.getQueryData(['private']), 'A');
        const pending = intercept();
        const logout = store.dispatch(authThunks.startLogout());
        const rejected = assert.rejects(logout, axios.isCancel);
        store.dispatch(auth.onLogin(session('B')));
        pending[0].finish({});
        await rejected;
        assert.equal(store.getState().auth.user.nombre, 'B');
    });
});
