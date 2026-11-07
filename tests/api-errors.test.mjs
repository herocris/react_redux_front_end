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
    const { getApiErrorMessage, getApiErrorText } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const { userSlice } = await server.ssrLoadModule('/src/modules/user/slices/userSlice.ts');
    const thunks = await server.ssrLoadModule('/src/modules/user/thunks/userThunks.ts');
    const auth = await server.ssrLoadModule('/src/modules/auth/thunks/aurthThunks.ts');
    const { authSlice } = await server.ssrLoadModule('/src/modules/auth/slices/authSlice.ts');
    const originalAdapter = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = originalAdapter; });
    const user = { id: '7', nombre: 'Prueba', correo: 'prueba@example.test' };
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

    await t.test('los cuatro thunks publican el error, terminan loading y conservan los datos', async () => {
        const requests = [
            () => thunks.startLoadingUsers(1, 'id', 'asc', 10, '', ''),
            () => thunks.startSaveUser(user),
            () => thunks.startUpdateUser(user),
            () => thunks.startDeleteUser(user),
        ];
        for (const reason of [networkError, validation, null]) {
            for (const request of requests) {
                const store = configureStore({ reducer: userSlice.reducer });
                store.dispatch(userSlice.actions.setUsers([user]));
                store.dispatch(userSlice.actions.onSetActiveUser(user));
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(store.dispatch(request()), error => error === reason);
                const state = store.getState();
                assert.equal(state.loading, false);
                assert.deepEqual(state.users, [user]);
                assert.deepEqual(state.activeUser, user);
                assert.deepEqual(state.errorMessage, getApiErrorMessage(reason));
            }
        }
    });

    await t.test('un reintento exitoso limpia el error y conserva el contrato de identificador', async () => {
        const store = configureStore({ reducer: userSlice.reducer });
        store.dispatch(userSlice.actions.onSetErrorMessage('Error anterior'));
        api.defaults.adapter = async config => {
            assert.equal(config.withCredentials, true);
            assert.equal(config.url, '/user');
            assert.equal(config.method, 'post');
            assert.deepEqual(store.getState().errorMessage, {});
            return { data: { identificador: '7', nombre: user.nombre, correo: user.correo },
                status: 200, statusText: 'OK', headers: {}, config };
        };
        await store.dispatch(thunks.startSaveUser(user));
        assert.deepEqual(store.getState().users, [user]);
        assert.equal(store.getState().loading, false);
        assert.deepEqual(store.getState().errorMessage, {});
    });

    await t.test('login y registro terminan con un mensaje ante fallos de red', async t => {
        t.mock.method(console, 'log', () => {});
        t.mock.timers.enable({ apis: ['setTimeout'] });
        for (const reason of [networkError, validation, undefined]) {
            for (const request of [
                auth.startLoginWithEmailPassword({ email: user.correo, password: 'test' }),
                auth.startCreatingUserWithEmailPassword({ name: user.nombre, email: user.correo, password: 'test' }),
            ]) {
                const store = configureStore({ reducer: authSlice.reducer });
                api.defaults.adapter = async () => { throw reason; };
                await store.dispatch(request);
                assert.equal(store.getState().status, 'not-authenticated');
                assert.equal(store.getState().errorMessage, getApiErrorText(reason));
                t.mock.timers.tick(4000);
                assert.equal(store.getState().errorMessage, undefined);
            }
        }
    });
});
