import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('CRUD de roles: errores, reintentos y contrato JSON', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `rol-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { roleSlice: slice } = await server.ssrLoadModule('/src/modules/rol/slices/rolSlice.ts');
    const thunks = await server.ssrLoadModule('/src/modules/rol/thunks/rolThunks.ts');
    const { getApiErrorMessage } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const item = { id: '7', nombre: 'Original', permisos: ['read', 2] };
    const makeStore = () => {
        const store = configureStore({ reducer: slice.reducer });
        store.dispatch(slice.actions.setRoles([item]));
        store.dispatch(slice.actions.onSetActiveRole(item));
        return store;
    };
    const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });

    await t.test('los cuatro thunks conservan causa, datos y selección ante fallos', async () => {
        for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: { nombre: ['Duplicado'] } }, { error: { permisos: ['No disponibles'], ajeno: ['General'] } }, null]) {
            for (const action of [
                () => thunks.startLoadingRoles(1, 'id', 'asc', 10, '', ''),
                () => thunks.startSaveRol(item),
                () => thunks.startUpdateRol(item),
                () => thunks.startDeleteRol(item),
            ]) {
                const store = makeStore();
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(store.dispatch(action()), error => error === reason);
                assert.equal(store.getState().loading, false);
                assert.deepEqual(store.getState().roles, [item]);
                assert.deepEqual(store.getState().activeRole, item);
                assert.deepEqual(store.getState().errorMessage, getApiErrorMessage(reason));
            }
        }
    });

    await t.test('crear y editar preservan JSON, permisos, cookies e identificadores', async () => {
        for (const update of [false, true]) {
            for (const permisos of [[], ['read', 2], [{ identificador: 'read', nombre: 'Leer' }]]) {
                const store = makeStore();
                store.dispatch(slice.actions.onSetErrorMessage('Anterior'));
                const values = { nombre: 'Nuevo', permisos, ...(update ? { id: '7' } : {}) };
                api.defaults.adapter = async config => {
                    assert.equal(config.url, update ? '/role/7' : '/role');
                    assert.equal(config.method, update ? 'put' : 'post');
                    assert.equal(config.withCredentials, true);
                    assert.match(config.headers.get('Content-Type'), /application\/json/);
                    assert.deepEqual(JSON.parse(config.data), values);
                    assert.deepEqual(store.getState().errorMessage, {});
                    return success(config, { identificador: update ? '7' : '8', nombre: 'Nuevo', permisos });
                };
                await store.dispatch(update ? thunks.startUpdateRol(values) : thunks.startSaveRol(values));
                const saved = store.getState().roles.find(role => role.id === (update ? '7' : '8'));
                assert.deepEqual(saved, { id: update ? '7' : '8', nombre: 'Nuevo', permisos });
                assert.equal(store.getState().loading, false);
            }
        }
    });

    await t.test('el esquema conserva permisos sin transformar valores y permite omitirlos', async () => {
        const { roleSchema } = await server.ssrLoadModule('/src/modules/rol/validators/roleValidations.ts');
        for (const permisos of [undefined, [], ['read', 2], [{ identificador: 'read', nombre: 'Leer' }]]) {
            const values = { nombre: 'Rol', ...(permisos === undefined ? {} : { permisos }) };
            assert.deepEqual(roleSchema.parse(values), values);
        }
        assert.equal(roleSchema.safeParse({ nombre: '' }).success, false);
    });

    await t.test('un reintento conserva permisos y limpia el error en el mismo store', async () => {
        const store = makeStore();
        const reason = { error: 'Temporal' };
        api.defaults.adapter = async () => { throw reason; };
        await assert.rejects(store.dispatch(thunks.startUpdateRol(item)), error => error === reason);
        const retained = store.getState().activeRole;
        api.defaults.adapter = async config => {
            assert.deepEqual(JSON.parse(config.data).permisos, item.permisos);
            assert.deepEqual(store.getState().errorMessage, {});
            return success(config, { identificador: item.id, nombre: item.nombre, permisos: item.permisos });
        };
        await store.dispatch(thunks.startUpdateRol(retained));
        assert.deepEqual(store.getState().roles, [item]);
        assert.deepEqual(store.getState().activeRole.permisos, []);
    });

    await t.test('borrar solo elimina la fila tras confirmación del servidor', async () => {
        const store = makeStore();
        api.defaults.adapter = async config => {
            assert.equal(config.method, 'delete');
            assert.equal(config.url, '/role/7');
            assert.equal(store.getState().roles.length, 1);
            return success(config, {});
        };
        await store.dispatch(thunks.startDeleteRol(item));
        assert.deepEqual(store.getState().roles, []);
        assert.equal(store.getState().loading, false);
    });
});
