import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';

test('los ocho listados antiguos conservan solo la petición vigente', async t => {
    t.mock.method(console, 'log', () => {});
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `lists-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const originalAdapter = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = originalAdapter; });
    const modules = [
        ['user', 'user', 'startLoadingUsers', 'users', 'user'],
        ['ammunition', 'ammunition', 'startLoadingAmmunitions', 'ammunitions', 'ammunition'],
        ['drug', 'drug', 'startLoadingDrugs', 'drugs', 'drug'],
        ['weapon', 'weapon', 'startLoadingWeapons', 'weapons', 'weapon'],
        ['drugPresentation', 'drugPresentation', 'startLoadingDrugPresentations', 'drugPresentations', 'drugPresentation'],
        ['rol', 'role', 'startLoadingRoles', 'roles', 'role'],
        ['activity', 'activity', 'startLoadingActivities', 'activities', 'activity'],
        ['confiscation', 'confiscation', 'startLoadingConfiscations', 'confiscations', 'confiscation'],
    ];
    for (const [domain, sliceName, loadName, collection, endpoint] of modules) {
        await t.test(domain, async t => {
            const sliceFile = domain === 'rol' ? 'rol' : sliceName;
            const sliceModule = await server.ssrLoadModule(`/src/modules/${domain}/slices/${sliceFile}Slice.ts`);
            const thunkFile = domain === 'rol' ? 'rol' : domain;
            const thunks = await server.ssrLoadModule(`/src/modules/${domain}/thunks/${thunkFile}Thunks.ts`);
            const slice = sliceModule[`${sliceName}Slice`];
            const load = (page, signal) => thunks[loadName](page, 'id', 'asc', 10, '', '', signal);
            let pending = [];
            api.defaults.adapter = config => new Promise((resolve, reject) => {
                pending.push({ signal: config.signal, reject, resolve: (id, page) => resolve({
                    data: { data: [{ identificador: id, nombre: id, cambios: {}, fecha: '2026-11-07' }], current_page: page, total: 1 },
                    status: 200, statusText: 'OK', headers: {}, config,
                }) });
                assert.match(config.url, new RegExp(`^/${endpoint}\\?page=`));
                assert.match(config.url, /sort_by=identificador/);
                assert.equal(config.withCredentials, true);
            });

            await t.test('una respuesta antigua no oculta la carga de la nueva', async () => {
                const store = configureStore({ reducer: slice.reducer });
                const old = store.dispatch(load(2));
                const latest = store.dispatch(load(3));
                assert.equal(pending[0].signal.aborted, true);
                pending[0].resolve('old', 2);
                await old;
                assert.equal(store.getState().loading, true);
                assert.equal(store.getState()[collection].length, 0);
                pending[1].resolve('latest', 3);
                await latest;
                assert.equal(store.getState()[collection][0].id, 'latest');
                assert.equal(store.getState().tableOptions.current_page, 3);
                assert.equal(store.getState().loading, false);
            });

            await t.test('una respuesta tardía no reemplaza los resultados recientes', async () => {
                pending = [];
                const store = configureStore({ reducer: slice.reducer });
                const old = store.dispatch(load(2));
                const latest = store.dispatch(load(3));
                pending[1].resolve('latest', 3);
                await latest;
                const state = store.getState();
                pending[0].resolve('old', 2);
                await old;
                assert.deepEqual(store.getState(), state);
            });

            await t.test('cancelar al desmontar termina carga sin publicar error', async () => {
                pending = [];
                const store = configureStore({ reducer: slice.reducer });
                const initialError = store.getState().errorMessage;
                const controller = new AbortController();
                const request = store.dispatch(load(1, controller.signal));
                controller.abort();
                pending[0].reject(new Error('Transport cancelled'));
                await request;
                assert.equal(store.getState().loading, false);
                assert.equal(store.getState()[collection].length, 0);
                assert.deepEqual(store.getState().errorMessage, initialError);
            });

            await t.test('dos stores no cancelan peticiones entre sí', async () => {
                pending = [];
                const firstStore = configureStore({ reducer: slice.reducer });
                const secondStore = configureStore({ reducer: slice.reducer });
                const first = firstStore.dispatch(load(1));
                const second = secondStore.dispatch(load(2));
                assert.equal(pending[0].signal.aborted, false);
                pending[0].resolve('first', 1);
                pending[1].resolve('second', 2);
                await Promise.all([first, second]);
                assert.equal(firstStore.getState()[collection][0].id, 'first');
                assert.equal(secondStore.getState()[collection][0].id, 'second');
            });
        });
    }
});
