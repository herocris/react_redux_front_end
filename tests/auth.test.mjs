import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('autenticación: contratos del service y transiciones de sesión', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `auth-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { authService } = await server.ssrLoadModule('/src/modules/auth/services/authService.ts');
    const { authSlice } = await server.ssrLoadModule('/src/modules/auth/slices/authSlice.ts');
    const thunks = await server.ssrLoadModule('/src/modules/auth/thunks/aurthThunks.ts');
    const selectors = await server.ssrLoadModule('/src/modules/auth/selectors.ts');
    const originalAdapter = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = originalAdapter; });
    const credentials = { email: 'session@example.test', password: 'secret-test' };
    const registration = { ...credentials, name: 'Sesión', passwordConfirmation: credentials.password };
    const response = {
        user: { name: registration.name, email: credentials.email },
        roles: ['admin', 2, { identificador: '3', nombre: 'Operador' }],
        permissions: [1, 'read', { identificador: '4', nombre: 'Leer' }],
    };
    const session = { nombre: registration.name, correo: credentials.email,
        roles: response.roles, permisos: response.permissions };
    const reply = (config, data = response) => ({ data, status: 200, statusText: 'OK', headers: {}, config });
    const newStore = () => configureStore({ reducer: { auth: authSlice.reducer } });

    await t.test('POST, payloads, cookies y adaptación sin reinterpretar relaciones', async () => {
        const controller = new AbortController();
        for (const [path, payload, call, expected] of [
            ['/login', credentials, () => authService.login(credentials), session],
            ['/register', { name: registration.name, ...credentials }, () => authService.register(registration), session],
            ['/refresh', undefined, () => authService.checkSession(controller.signal), session],
            ['/logout', undefined, () => authService.logout(), undefined],
        ]) {
            api.defaults.adapter = async config => {
                assert.equal(config.method, 'post');
                assert.equal(config.url, path);
                assert.equal(config.withCredentials, true);
                assert.deepEqual(config.data ? JSON.parse(config.data) : undefined, payload);
                if (path === '/refresh') assert.equal(config.signal, controller.signal);
                return reply(config);
            };
            assert.deepEqual(await call(), expected);
        }
        api.defaults.adapter = async config => reply(config, { user: session });
        assert.deepEqual(await authService.register(registration), session);
    });

    await t.test('los cuatro métodos propagan la causa HTTP, red y valores desconocidos', async () => {
        for (const reason of [{ error: { email: ['Ya existe.'] } },
            new axios.AxiosError('Network Error', 'ERR_NETWORK'), null, undefined]) {
            api.defaults.adapter = async () => { throw reason; };
            for (const call of [() => authService.login(credentials), () => authService.register(registration),
                () => authService.checkSession(), () => authService.logout()]) {
                await assert.rejects(call(), error => error === reason);
            }
        }
        const body = { error: 'Sesión caducada.' };
        api.defaults.adapter = async config => {
            throw new axios.AxiosError('HTTP error', 'ERR_BAD_RESPONSE', config, undefined,
                { ...reply(config, body), status: 401 });
        };
        await assert.rejects(authService.checkSession(), error => error === body);
    });

    await t.test('refresh acepta cancelación sin publicar datos desde el service', async () => {
        const controller = new AbortController();
        controller.abort();
        let calls = 0;
        api.defaults.adapter = async config => { calls++; return reply(config); };
        await assert.rejects(authService.checkSession(controller.signal), axios.isCancel);
        assert.equal(calls, 0);
    });

    await t.test('reducers y selectores: comprobación, sesión, error y salida', () => {
        const store = newStore();
        assert.equal(selectors.selectAuthStatus(store.getState()), 'checking');
        store.dispatch(authSlice.actions.onLogin(session));
        assert.deepEqual(selectors.selectSessionUser(store.getState()), session);
        assert.equal(selectors.selectAuthStatus(store.getState()), 'authenticated');
        store.dispatch(authSlice.actions.onLogout('Error de acceso.'));
        assert.equal(selectors.selectAuthError(store.getState()), 'Error de acceso.');
        assert.equal(selectors.selectSessionUser(store.getState()).correo, '');
        store.dispatch(authSlice.actions.clearErrorMessage());
        assert.equal(selectors.selectAuthError(store.getState()), undefined);
        store.dispatch(thunks.checkingAuthentication());
        assert.equal(selectors.selectAuthStatus(store.getState()), 'checking');
    });

    await t.test('comprobación inicial: éxito autentica y fallo deja la ruta pública sin error de envío', async () => {
        for (const success of [true, false]) {
            const store = newStore();
            api.defaults.adapter = async config => {
                assert.equal(store.getState().auth.status, 'checking');
                if (!success) throw { error: 'Sin sesión.' };
                return reply(config);
            };
            await store.dispatch(thunks.checkAuthToken());
            assert.equal(store.getState().auth.status, success ? 'authenticated' : 'not-authenticated');
            assert.equal(store.getState().auth.errorMessage, undefined);
            if (success) assert.deepEqual(store.getState().auth.user, session);
        }
    });

    await t.test('login y registro: fallo, reintento pendiente sin checking y éxito con sesión normalizada', async () => {
        for (const request of [() => thunks.startLoginWithEmailPassword(credentials),
            () => thunks.startCreatingUserWithEmailPassword(registration)]) {
            const store = newStore();
            store.dispatch(authSlice.actions.onLogout());
            api.defaults.adapter = async () => { throw { error: 'Acceso rechazado.' }; };
            await store.dispatch(request());
            assert.equal(store.getState().auth.status, 'not-authenticated');
            assert.equal(store.getState().auth.errorMessage, 'Acceso rechazado.');
            let finish;
            api.defaults.adapter = config => new Promise(resolve => { finish = () => resolve(reply(config)); });
            const pending = store.dispatch(request());
            await new Promise(resolve => setImmediate(resolve));
            assert.equal(store.getState().auth.status, 'not-authenticated');
            assert.equal(store.getState().auth.errorMessage, undefined);
            finish();
            await pending;
            assert.deepEqual(store.getState().auth.user, session);
            assert.equal(store.getState().auth.status, 'authenticated');
        }
    });

    await t.test('logout espera éxito; el fallo conserva sesión y rechaza con su causa', async () => {
        const store = newStore();
        store.dispatch(authSlice.actions.onLogin(session));
        const reason = { error: 'No se pudo salir.' };
        api.defaults.adapter = async () => { throw reason; };
        await assert.rejects(store.dispatch(thunks.startLogout()), error => error === reason);
        assert.equal(store.getState().auth.status, 'authenticated');
        let finish;
        api.defaults.adapter = config => new Promise(resolve => { finish = () => resolve(reply(config)); });
        const pending = store.dispatch(thunks.startLogout());
        await new Promise(resolve => setImmediate(resolve));
        assert.deepEqual(store.getState().auth.user, session);
        finish();
        await pending;
        assert.equal(store.getState().auth.status, 'not-authenticated');
        assert.equal(store.getState().auth.user.correo, '');
    });
});
