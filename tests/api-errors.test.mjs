import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('errores HTTP y thunks con el cliente real y un transporte simulado', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `api-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { getApiErrorMessage, getApiErrorText, getApiErrorKind, getApiErrorStatus, getApiErrorCause } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const auth = await server.ssrLoadModule('/src/modules/auth/thunks/aurthThunks.ts');
    const { authSlice } = await server.ssrLoadModule('/src/modules/auth/slices/authSlice.ts');
    const originalAdapter = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = originalAdapter; });
    const user = { id: 7, nombre: 'Prueba', correo: 'prueba@example.test' };
    const networkError = new axios.AxiosError('Network Error', 'ERR_NETWORK');
    const validation = { error: { correo: ['El correo ya existe.'] } };

    await t.test('el interceptor conserva el rechazo y su causa', async () => {
        const cases = [networkError, new Error('Fallo interno'), null, undefined];
        for (const reason of cases) {
            api.defaults.adapter = async () => { throw reason; };
            await assert.rejects(api.get('/test'), error => error === reason);
        }
        for (const body of [validation, { error: 'Sin permiso.' }, '', '<html>Error</html>']) {
            api.defaults.adapter = async config => {
                throw new axios.AxiosError('HTTP error', 'ERR_BAD_RESPONSE', config, undefined,
                    { data: body, status: 422, statusText: 'Error', headers: {}, config });
            };
            await assert.rejects(api.get('/test'), error => error === body);
        }
    });

    await t.test('normaliza errores para la UI sin perder la validación por campo', () => {
        assert.deepEqual(getApiErrorMessage(validation), validation.error);
        assert.equal(getApiErrorText(validation), 'El correo ya existe.');
        assert.equal(getApiErrorMessage({ error: 'Sin permiso.' }), 'Sin permiso.');
        assert.match(getApiErrorText(networkError), /conectar con el servidor/);
        for (const reason of [null, undefined, {}, '<html>Error</html>', { error: { correo: null } }]) {
            assert.match(getApiErrorText(reason), /No se pudo completar/);
        }
    });

    await t.test('404 conserva recurso, causa y rechazo sin confundirse con ruta inexistente o 403', async () => {
        const body = { message: 'Private model detail' };
        let cause;
        api.defaults.adapter = async config => {
            cause = new axios.AxiosError('Missing', 'ERR_BAD_REQUEST', config, undefined,
                { data: body, status: 404, statusText: 'Not Found', headers: {}, config });
            throw cause;
        };
        await assert.rejects(api.get('/confiscation/999999'), error => error === body);
        assert.equal(getApiErrorStatus(body), 404);
        assert.equal(getApiErrorCause(body), cause);
        assert.match(getApiErrorText(body), /^Recurso no encontrado/);
        assert.doesNotMatch(getApiErrorText(body), /Private|Página|Acceso denegado/);
        assert.match(getApiErrorText({ response: { status: 404, data: body } }), /^Recurso no encontrado/);
    });

    await t.test('clasifica cuerpos reales 401/403 sin deducir autorización del texto', () => {
        assert.equal(getApiErrorKind({ error: 'No autenticado', code: 401 }), 'unauthenticated');
        assert.equal(getApiErrorKind({ error: 'This action is unauthorized.', code: 403 }), 'forbidden');
        assert.equal(getApiErrorKind({ error: 'Sin permiso.' }), 'other');
        assert.equal(getApiErrorKind(networkError), 'transport');
        assert.equal(getApiErrorKind(new Error('error local')), 'other');
        assert.equal(getApiErrorStatus({ code: '403' }), undefined);
        assert.equal(getApiErrorStatus({ code: 4030 }), undefined);
        assert.deepEqual(getApiErrorMessage({ message: 'Invalid', errors: { nombre: ['Obligatorio'] } }), { nombre: ['Obligatorio'] });
    });

    await t.test('el estado HTTP prevalece sobre el body y conserva identidad, campos y causa sin mutarlo', async () => {
        for (const [status, kind] of [[401, 'unauthenticated'], [403, 'forbidden'], [500, 'server'], [503, 'server'], [422, 'other']]) {
            const body = Object.freeze({ error: { nombre: ['Valor inválido'] }, code: 400 });
            let original;
            api.defaults.adapter = async config => {
                original = new axios.AxiosError('HTTP error', 'ERR_BAD_RESPONSE', config, undefined,
                    { data: body, status, statusText: 'Error', headers: {}, config });
                throw original;
            };
            await assert.rejects(api.get('/test'), error => {
                assert.equal(error, body);
                assert.equal(getApiErrorStatus(error), status);
                assert.equal(getApiErrorKind(error), kind);
                assert.equal(getApiErrorCause(error), original);
                assert.equal(getApiErrorKind(original), kind);
                assert.deepEqual(Object.keys(body), ['error', 'code']);
                if (status === 422) assert.deepEqual(getApiErrorMessage(error), body.error);
                else assert.equal(typeof getApiErrorMessage(error), 'string');
                return true;
            });
        }
    });

    await t.test('403 de lectura y escritura no renueva ni cierra sesión ni invalida como éxito', async () => {
        const { QueryObserver } = await import('@tanstack/react-query');
        const { createAppQueryClient } = await server.ssrLoadModule('/src/queries/queryClient.ts');
        const { drugListOptions, drugMutationOptions } = await server.ssrLoadModule('/src/modules/drug/queries/drugQueries.ts');
        const { store } = await server.ssrLoadModule('/src/store/store.ts');
        store.dispatch(authSlice.actions.onLogin(user));
        const client = createAppQueryClient();
        const defaults = client.getDefaultOptions();
        client.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, gcTime: Infinity },
            mutations: { ...defaults.mutations, gcTime: Infinity } });
        const requests = [];
        const denied = { error: 'This action is unauthorized.', code: 403 };
        api.defaults.adapter = async config => {
            requests.push(config.url);
            throw new axios.AxiosError('Forbidden', 'ERR_BAD_REQUEST', config, undefined,
                { data: denied, status: 403, statusText: 'Forbidden', headers: {}, config });
        };
        const observer = new QueryObserver(client, drugListOptions({ page: 1, per_page: 10, sortBy: 'id', orderType: 'asc', search_by: '', valueSearch: '' }));
        const unsubscribe = observer.subscribe(() => {});
        try {
            await observer.refetch();
            assert.equal(observer.getCurrentResult().error, denied);
            const beforeWrite = client.getQueryCache().getAll().map(query => query.state.isInvalidated);
            let success = 0;
            const mutation = client.getMutationCache().build(client, drugMutationOptions(client, () => { success++; }));
            await assert.rejects(mutation.execute({ type: 'delete', id: 7 }), error => error === denied);
            assert.equal(mutation.state.status, 'error');
            assert.equal(success, 0);
            assert.equal(store.getState().auth.status, 'authenticated');
            assert.equal(requests.length, 2);
            assert.ok(requests.every(url => !/refresh|logout/.test(url)));
            assert.deepEqual(client.getQueryCache().getAll().map(query => query.state.isInvalidated), beforeWrite);
        } finally { unsubscribe(); client.clear(); }
    });

    await t.test('403 de refresh conserva la sesión o el estado inicial y propaga la causa al consumidor', async () => {
        const denied = { error: 'User does not have the right permissions.', code: 403 };
        for (const authenticated of [false, true]) {
            const store = configureStore({ reducer: authSlice.reducer });
            if (authenticated) store.dispatch(authSlice.actions.onLogin(user));
            const before = store.getState();
            let calls = 0;
            api.defaults.adapter = async () => { calls++; throw denied; };
            await assert.rejects(store.dispatch(auth.checkAuthToken()), error => error === denied);
            assert.deepEqual(store.getState(), before);
            assert.equal(calls, 1);
        }
    });

    await t.test('login y registro terminan con un mensaje ante fallos de red', async t => {
        t.mock.method(console, 'log', () => {});
        t.mock.timers.enable({ apis: ['setTimeout'] });
        for (const reason of [networkError, validation, undefined]) {
            for (const request of [
                auth.startLoginWithEmailPassword({ email: user.correo, password: 'test' }),
                auth.startCreatingUserWithEmailPassword({ name: user.nombre, email: user.correo, password: 'test' }),
            ]) {
                const store = configureStore({ reducer: { auth: authSlice.reducer } });
                api.defaults.adapter = async () => { throw reason; };
                await store.dispatch(request);
                assert.equal(store.getState().auth.status, 'not-authenticated');
                assert.equal(store.getState().auth.errorMessage, getApiErrorText(reason));
                t.mock.timers.tick(4000);
                assert.equal(store.getState().auth.errorMessage, getApiErrorText(reason));
            }
        }
    });

    await t.test('login y registro mantienen la ruta pública durante la petición y autentican al terminar', async () => {
        for (const thunk of [
            auth.startLoginWithEmailPassword({ email: user.correo, password: 'test' }),
            auth.startCreatingUserWithEmailPassword({ name: user.nombre, email: user.correo, password: 'test' }),
        ]) {
            const store = configureStore({ reducer: authSlice.reducer });
            store.dispatch(authSlice.actions.onLogout());
            let finish;
            api.defaults.adapter = config => new Promise(resolve => {
                finish = () => resolve({ data: { user: { name: user.nombre, email: user.correo }, roles: [], permissions: [] },
                    status: 200, statusText: 'OK', headers: {}, config });
            });
            const request = store.dispatch(thunk);
            await Promise.resolve();
            await Promise.resolve();
            assert.equal(store.getState().status, 'not-authenticated');
            finish();
            await request;
            assert.equal(store.getState().status, 'authenticated');
        }
    });
});
