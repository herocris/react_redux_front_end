import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('CRUD de permisos: transiciones, errores y reintentos Redux', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `permission-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { permissionSlice: slice } = await server.ssrLoadModule('/src/modules/permission/slices/permissionSlice.ts');
    const thunks = await server.ssrLoadModule('/src/modules/permission/thunks/permissionThunks.ts');
    const { getApiErrorMessage } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const item = { id: '7', nombre: 'Original' };
    const makeStore = () => {
        const store = configureStore({ reducer: slice.reducer });
        store.dispatch(slice.actions.setPermissions([item]));
        store.dispatch(slice.actions.onSetActivePermission(item));
        return store;
    };
    const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });

    await t.test('los cuatro thunks conservan causa, datos y selección ante fallos', async () => {
        for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: { nombre: ['Duplicado'] } }, { error: { ajeno: ['General'] } }, null]) {
            for (const action of [
                () => thunks.startLoadingPermissions(1, 'id', 'asc', 10, '', ''),
                () => thunks.startSavePermission(item),
                () => thunks.startUpdatePermission(item),
                () => thunks.startDeletePermission(item),
            ]) {
                const store = makeStore();
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(store.dispatch(action()), error => error === reason);
                assert.equal(store.getState().loading, false);
                assert.deepEqual(store.getState().permissions, [item]);
                assert.deepEqual(store.getState().activePermission, item);
                assert.deepEqual(store.getState().errorMessage, getApiErrorMessage(reason));
            }
        }
    });

    await t.test('crear y editar publican la entidad y limpian error y selección tras éxito', async () => {
        for (const update of [false, true]) {
            {
                const store = makeStore();
                store.dispatch(slice.actions.onSetErrorMessage('Anterior'));
                const values = { nombre: 'Nuevo', ...(update ? { id: '7' } : {}) };
                api.defaults.adapter = async config => {
                    assert.equal(store.getState().loading, true);
                    assert.deepEqual(store.getState().permissions, [item]);
                    assert.deepEqual(store.getState().errorMessage, {});
                    return success(config, { identificador: update ? '7' : '8', nombre: 'Nuevo' });
                };
                await store.dispatch(update ? thunks.startUpdatePermission(values) : thunks.startSavePermission(values));
                const saved = store.getState().permissions.find(permission => permission.id === (update ? '7' : '8'));
                assert.deepEqual(saved, { id: update ? '7' : '8', nombre: 'Nuevo' });
                assert.equal(store.getState().loading, false);
                assert.deepEqual(store.getState().activePermission, { nombre: '' });
            }
        }
    });

    await t.test('el esquema conserva nombre e identificador sin transformar', async () => {
        const { permissionSchema } = await server.ssrLoadModule('/src/modules/permission/validators/permissionValidations.ts');
        const values = { nombre: 'Leer', identificador: 'read' };
        assert.deepEqual(permissionSchema.parse(values), values);
        assert.equal(permissionSchema.safeParse({ nombre: '' }).success, false);
    });

    await t.test('un reintento conserva campos y limpia el error en el mismo store', async () => {
        const store = makeStore();
        const reason = { error: 'Temporal' };
        api.defaults.adapter = async () => { throw reason; };
        await assert.rejects(store.dispatch(thunks.startUpdatePermission(item)), error => error === reason);
        const retained = store.getState().activePermission;
        api.defaults.adapter = async config => {
            assert.deepEqual(store.getState().errorMessage, {});
            return success(config, { identificador: item.id, nombre: item.nombre });
        };
        await store.dispatch(thunks.startUpdatePermission(retained));
        assert.deepEqual(store.getState().permissions, [item]);
        assert.deepEqual(store.getState().activePermission, { nombre: '' });
    });

    await t.test('borrar solo elimina la fila tras confirmación del servidor', async () => {
        const store = makeStore();
        api.defaults.adapter = async config => {
            assert.equal(store.getState().loading, true);
            assert.equal(store.getState().permissions.length, 1);
            return success(config, {});
        };
        await store.dispatch(thunks.startDeletePermission(item));
        assert.deepEqual(store.getState().permissions, []);
        assert.equal(store.getState().loading, false);
    });
});
