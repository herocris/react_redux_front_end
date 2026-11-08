import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('CRUD de municiones: errores, reintentos y contrato multipart', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `ammunition-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { ammunitionSlice: slice } = await server.ssrLoadModule('/src/modules/ammunition/slices/ammunitionSlice.ts');
    const thunks = await server.ssrLoadModule('/src/modules/ammunition/thunks/ammunitionThunks.ts');
    const { getApiErrorMessage } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const original = api.defaults.adapter;
    const originalEnv = api.defaults.env;
    // Match the browser's native FormData instead of Axios' Node transport helper.
    api.defaults.env = { ...originalEnv, FormData };
    t.after(() => { api.defaults.adapter = original; api.defaults.env = originalEnv; });
    const item = { id: '7', descripcion: 'Munición', logo: 'logo.png' };
    const makeStore = () => {
        const store = configureStore({ reducer: slice.reducer });
        store.dispatch(slice.actions.setAmmunitions([item]));
        store.dispatch(slice.actions.onSetActiveAmmunition(item));
        return store;
    };
    const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });

    await t.test('los cuatro thunks conservan causa, datos y selección ante fallos', async () => {
        for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: { descripcion: ['Duplicada'] } }, null]) {
            for (const action of [
                () => thunks.startLoadingAmmunitions(1, 'id', 'asc', 10, '', ''),
                () => thunks.startSaveAmmunition(item),
                () => thunks.startUpdateAmmunition(item),
                () => thunks.startDeleteAmmunition(item),
            ]) {
                const store = makeStore();
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(store.dispatch(action()), error => error === reason);
                assert.equal(store.getState().loading, false);
                assert.deepEqual(store.getState().ammunitions, [item]);
                assert.deepEqual(store.getState().activeAmmunition, item);
                assert.deepEqual(store.getState().errorMessage, getApiErrorMessage(reason));
            }
        }
    });

    await t.test('crear conserva multipart, normaliza identificador y limpia errores', async () => {
        const store = makeStore();
        store.dispatch(slice.actions.onSetErrorMessage('Anterior'));
        const logo = new File(['imagen'], 'logo.png', { type: 'image/png' });
        api.defaults.adapter = async config => {
            assert.equal(config.url, '/ammunition');
            assert.equal(config.method, 'post');
            assert.equal(config.withCredentials, true);
            assert.equal(config.data.get('descripcion'), 'Nueva');
            assert.equal(config.data.get('logo').name, 'logo.png');
            assert.deepEqual(store.getState().errorMessage, {});
            return success(config, { identificador: '8', descripcion: 'Nueva', logo: 'nueva.png' });
        };
        await store.dispatch(thunks.startSaveAmmunition({ descripcion: 'Nueva', logo }));
        assert.equal(store.getState().ammunitions[1].id, '8');
        assert.equal(store.getState().loading, false);
    });

    await t.test('editar mantiene POST con _method=PUT y solo envía logo si es un archivo', async () => {
        for (const logo of ['logo.png', new File(['nueva'], 'nueva.png')]) {
            const store = makeStore();
            api.defaults.adapter = async config => {
                assert.equal(config.url, '/ammunition/7');
                assert.equal(config.method, 'post');
                assert.equal(config.data.get('_method'), 'PUT');
                assert.equal(config.data.get('descripcion'), 'Editada');
                assert.equal(config.data.has('logo'), logo instanceof File);
                return success(config, { identificador: '7', descripcion: 'Editada', logo: 'actual.png' });
            };
            await store.dispatch(thunks.startUpdateAmmunition({ ...item, descripcion: 'Editada', logo }));
            assert.deepEqual(store.getState().ammunitions, [{ id: '7', descripcion: 'Editada', logo: 'actual.png' }]);
        }
    });

    await t.test('borrar solo elimina la fila tras confirmación del servidor', async () => {
        const store = makeStore();
        api.defaults.adapter = async config => {
            assert.equal(config.method, 'delete');
            assert.equal(config.url, '/ammunition/7');
            assert.equal(store.getState().ammunitions.length, 1);
            return success(config, {});
        };
        await store.dispatch(thunks.startDeleteAmmunition(item));
        assert.deepEqual(store.getState().ammunitions, []);
        assert.equal(store.getState().loading, false);
    });
});
