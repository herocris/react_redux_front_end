import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { configureStore } from '@reduxjs/toolkit';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('guardado de confiscaciones: causa, conservación y reintento', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `confiscation-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const original = api.defaults.adapter;
    const env = api.defaults.env;
    api.defaults.env = { ...env, FormData };
    t.after(() => { api.defaults.adapter = original; api.defaults.env = env; });
    for (const domain of ['confiscation', 'drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
        const cap = domain[0].toUpperCase() + domain.slice(1);
        const { [domain + 'Slice']: slice } = await server.ssrLoadModule(`/src/modules/${domain}/slices/${domain}Slice.ts`);
        const thunks = await server.ssrLoadModule(`/src/modules/${domain}/thunks/${domain}Thunks.ts`);
        const main = domain === 'confiscation';
        const item = main
            ? { id: '7', fecha: '2026-11-08', observacion: 'Edición', direccion: 'Dirección', departamento: 'Depto', municipalidad: 'Municipio', latitud: 1, longitud: 2 }
            : { identificador: '8', decomiso: 7, cantidad: 3, peso: 2.5, droga: 1, presentacion: 2, arma: 3, municion: 4, foto: 'existente.png' };
        const response = main ? { ...item, identificador: '7' } : {
            ...item, decomiso: { identificador: 7 }, droga: { identificador: 1, descripcion: 'Droga' },
            presentacion: { identificador: 2, descripcion: 'Presentación' }, arma: { identificador: 3, descripcion: 'Arma' },
            municion: { identificador: 4, descripcion: 'Munición' },
        };
        await t.test(`${domain}: crear/editar conservan selección y causa; reintento conserva contrato`, async () => {
            for (const operation of ['Save', 'Update']) {
                for (const reason of [{ error: { cantidad: ['Revisar datos'] } }, new axios.AxiosError('Network Error', 'ERR_NETWORK'), null]) {
                    const store = configureStore({ reducer: slice.reducer });
                    store.dispatch(slice.actions['onSetActive' + cap](item));
                    const before = store.getState();
                    const input = main ? item : { ...item, foto: new File(['imagen'], 'prueba.png') };
                    api.defaults.adapter = async () => { throw reason; };
                    await assert.rejects(store.dispatch(thunks['start' + operation + cap](input)), error => error === reason);
                    assert.deepEqual(store.getState()['active' + cap], before['active' + cap]);
                    assert.deepEqual(store.getState()[domain + 's'], before[domain + 's']);
                    assert.equal(store.getState().loading, false);
                    api.defaults.adapter = async config => {
                        assert.equal(config.withCredentials, true);
                        assert.equal(config.url, '/' + domain + (operation === 'Update' ? '/' + (main ? '7' : '8') : ''));
                        assert.equal(config.method, main && operation === 'Update' ? 'put' : 'post');
                        if (!main) {
                            assert.equal(config.data.get('foto').name, 'prueba.png');
                            assert.equal(config.data.get('decomiso'), '7');
                            if (operation === 'Update') assert.equal(config.data.get('_method'), 'PUT');
                        } else assert.equal(JSON.parse(config.data).observacion, 'Edición');
                        return { config, data: response, status: 200, statusText: 'OK', headers: {} };
                    };
                    await store.dispatch(thunks['start' + operation + cap](input));
                    assert.equal(store.getState().loading, false);
                }
            }
        });
    }
});
