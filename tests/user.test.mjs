import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('CRUD de usuarios: errores, reintentos y contrato JSON', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `user-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { userSlice: slice } = await server.ssrLoadModule('/src/modules/user/slices/userSlice.ts');
    const thunks = await server.ssrLoadModule('/src/modules/user/thunks/userThunks.ts');
    const { getApiErrorMessage } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const item = { id: '7', nombre: 'Original', correo: 'fixture@example.test', password: 'fixture-only', roles: ['admin', 3], permisos: ['read', 2] };
    const makeStore = () => {
        const store = configureStore({ reducer: slice.reducer });
        store.dispatch(slice.actions.setUsers([item]));
        store.dispatch(slice.actions.onSetActiveUser(item));
        return store;
    };
    const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });

    await t.test('los cuatro thunks conservan causa, datos y selección ante fallos', async () => {
        for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: { nombre: ['Duplicado'] } }, { error: { permisos: ['No disponibles'], ajeno: ['General'] } }, null]) {
            for (const action of [
                () => thunks.startLoadingUsers(1, 'id', 'asc', 10, '', ''),
                () => thunks.startSaveUser(item),
                () => thunks.startUpdateUser(item),
                () => thunks.startDeleteUser(item),
            ]) {
                const store = makeStore();
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(store.dispatch(action()), error => error === reason);
                assert.equal(store.getState().loading, false);
                assert.deepEqual(store.getState().users, [item]);
                assert.deepEqual(store.getState().activeUser, item);
                assert.deepEqual(store.getState().errorMessage, getApiErrorMessage(reason));
            }
        }
    });

    await t.test('crear y editar preservan JSON, permisos, cookies e identificadores', async () => {
        for (const update of [false, true]) {
            for (const permisos of [[], ['read', 2], [{ identificador: 'read', nombre: 'Leer' }]]) {
                const store = makeStore();
                store.dispatch(slice.actions.onSetErrorMessage('Anterior'));
                const values = { nombre: 'Nuevo', correo: 'fixture@example.test', password: 'fixture-only', roles: permisos, permisos, ...(update ? { id: '7' } : {}) };
                api.defaults.adapter = async config => {
                    assert.equal(config.url, update ? '/user/7' : '/user');
                    assert.equal(config.method, update ? 'put' : 'post');
                    assert.equal(config.withCredentials, true);
                    assert.match(config.headers.get('Content-Type'), /application\/json/);
                    assert.deepEqual(JSON.parse(config.data), values);
                    assert.deepEqual(store.getState().errorMessage, {});
                    return success(config, { identificador: update ? '7' : '8', nombre: 'Nuevo', correo: 'fixture@example.test', password: 'fixture-only', roles: permisos, permisos });
                };
                await store.dispatch(update ? thunks.startUpdateUser(values) : thunks.startSaveUser(values));
                const saved = store.getState().users.find(role => role.id === (update ? '7' : '8'));
                assert.deepEqual(saved, { id: update ? '7' : '8', nombre: 'Nuevo', correo: 'fixture@example.test', password: 'fixture-only', roles: permisos, permisos });
                assert.equal(store.getState().loading, false);
            }
        }
    });

    await t.test('el esquema conserva permisos sin transformar valores y permite omitirlos', async () => {
        const { userSchema } = await server.ssrLoadModule('/src/modules/user/validators/userValidations.ts');
        for (const permisos of [undefined, [], ['read', 2], [{ identificador: 'read', nombre: 'Leer' }]]) {
            const values = { nombre: 'Rol', correo: 'fixture@example.test', password: 'fixture-only', roles: permisos, ...(permisos === undefined ? {} : { permisos }) };
            assert.deepEqual(userSchema.parse(values), values);
        }
        const valid = { nombre: 'Fixture', correo: 'fixture@example.test', password: 'fixture-only' };
        for (const password of [undefined, '', 'short']) {
            assert.equal(userSchema.safeParse({ ...valid, password }).success, false);
            assert.equal(userSchema.safeParse({ ...valid, identificador: '7', password }).success, false);
        }
        assert.equal(userSchema.safeParse({ ...valid, correo: 'invalid' }).success, false);
        assert.equal(userSchema.safeParse({ ...valid, nombre: '' }).success, false);
    });

    await t.test('un reintento conserva permisos y limpia el error en el mismo store', async () => {
        const store = makeStore();
        const reason = { error: 'Temporal' };
        api.defaults.adapter = async () => { throw reason; };
        await assert.rejects(store.dispatch(thunks.startUpdateUser(item)), error => error === reason);
        const retained = store.getState().activeUser;
        api.defaults.adapter = async config => {
            assert.deepEqual(JSON.parse(config.data).permisos, item.permisos);
            assert.deepEqual(store.getState().errorMessage, {});
            return success(config, { identificador: item.id, nombre: item.nombre, correo: item.correo, password: item.password, roles: item.roles, permisos: item.permisos });
        };
        await store.dispatch(thunks.startUpdateUser(retained));
        assert.deepEqual(store.getState().users, [item]);
        assert.deepEqual(store.getState().activeUser.permisos, []);
    });

    await t.test('borrar solo elimina la fila tras confirmación del servidor', async () => {
        const store = makeStore();
        api.defaults.adapter = async config => {
            assert.equal(config.method, 'delete');
            assert.equal(config.url, '/user/7');
            assert.equal(store.getState().users.length, 1);
            return success(config, {});
        };
        await store.dispatch(thunks.startDeleteUser(item));
        assert.deepEqual(store.getState().users, []);
        assert.equal(store.getState().loading, false);
    });
});
