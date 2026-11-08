import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import dayjs from 'dayjs';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('actividad: contrato de lectura, errores y reintentos', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `activity-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { activitySlice: slice } = await server.ssrLoadModule('/src/modules/activity/slices/activitySlice.ts');
    const { startLoadingActivities: load } = await server.ssrLoadModule('/src/modules/activity/thunks/activityThunks.ts');
    const { getApiErrorMessage } = await server.ssrLoadModule('/src/api/apiErrors.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const item = { id: '7', tipo_de_evento: 'update', id_usuario: 4, usuario: 'Fixture', cambios: '{}', fecha: '08-11-2026 12:13:14' };
    const makeStore = () => {
        const store = configureStore({ reducer: slice.reducer });
        store.dispatch(slice.actions.setPermissions([item]));
        return store;
    };
    const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });

    await t.test('los fallos conservan causa, filas y paginación y permiten reintentar', async () => {
        for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: 'Temporal' }, { error: { fecha: ['No disponible'] } }, null]) {
            const store = makeStore();
            const options = store.getState().tableOptions;
            api.defaults.adapter = async () => { throw reason; };
            await assert.rejects(store.dispatch(load(2, 'id', 'desc', 5, 'tipo_de_evento', 'update')), error => error === reason);
            assert.equal(store.getState().loading, false);
            assert.deepEqual(store.getState().activities, [item]);
            assert.deepEqual(store.getState().tableOptions, options);
            assert.deepEqual(store.getState().errorMessage, getApiErrorMessage(reason));
            api.defaults.adapter = async config => {
                assert.equal(config.method, 'get');
                assert.equal(config.url, '/activity?page=2&sort_by=identificador&type=desc&per_page=5&tipo_de_evento=update');
                assert.equal(config.withCredentials, true);
                assert.equal(store.getState().loading, true);
                assert.deepEqual(store.getState().errorMessage, {});
                return success(config, { ...options, current_page: 2, data: [{ ...item, identificador: '7', cambios: {}, fecha: '2026-11-08T12:13:14' }] });
            };
            await store.dispatch(load(2, 'id', 'desc', 5, 'tipo_de_evento', 'update'));
            assert.equal(store.getState().loading, false);
            assert.deepEqual(store.getState().activities, [item]);
            assert.equal(store.getState().tableOptions.current_page, 2);
        }
    });

    await t.test('preserva relaciones, campos, serialización y formato local de fechas sin logs', async () => {
        const log = t.mock.method(console, 'log', () => {});
        const store = makeStore();
        const changes = [{ antes: 1, despues: 2 }, ['a', 1], 'texto JSON', null, undefined];
        const dates = ['2026-11-08T12:13:14', '2026-11-08T12:13:14Z', 'sin-fecha'];
        for (const fecha of dates) {
            api.defaults.adapter = async config => success(config, {
                ...store.getState().tableOptions,
                data: changes.map((cambios, index) => ({ identificador: String(index), tipo_de_evento: 'update', descripcion: 'Fixture', id_usuario: 4, usuario: 'Fixture', cambios, fecha })),
            });
            await store.dispatch(load(1, 'fecha', 'asc', 10, '', ''));
            assert.deepEqual(store.getState().activities, changes.map((cambios, index) => ({ id: String(index), tipo_de_evento: 'update', descripcion: 'Fixture', id_usuario: 4, usuario: 'Fixture', cambios: JSON.stringify(cambios), fecha: dayjs(fecha).format('DD-MM-YYYY HH:mm:ss') })));
        }
        assert.equal(log.mock.callCount(), 0);
        log.mock.restore();
    });

    await t.test('un listado vacío reemplaza las filas y limpia errores', async () => {
        const store = makeStore();
        store.dispatch(slice.actions.onSetErrorMessage('Anterior'));
        api.defaults.adapter = async config => success(config, { ...store.getState().tableOptions, total: 0, data: [] });
        await store.dispatch(load(1, 'id', 'asc', 10, '', ''));
        assert.deepEqual(store.getState().activities, []);
        assert.deepEqual(store.getState().errorMessage, {});
        assert.equal(store.getState().loading, false);
    });
});
