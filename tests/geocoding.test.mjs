import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import axios from 'axios';
import { createServer } from 'vite';

test('geocodificación inversa: contrato, respuestas y cancelación', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `geocoding-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const { reverseGeocode } = await server.ssrLoadModule('/src/modules/confiscation/api/reverseGeocoding.ts');
    const originalAdapter = axios.defaults.adapter;
    t.after(() => { axios.defaults.adapter = originalAdapter; });
    const resolveWith = data => {
        axios.defaults.adapter = async config => ({ data, status: 200, statusText: 'OK', headers: {}, config });
    };

    await t.test('mantiene endpoint, coordenadas y parámetros sin credenciales del backend', async () => {
        const signal = new AbortController().signal;
        axios.defaults.adapter = async config => {
            assert.equal(config.url, 'https://nominatim.openstreetmap.org/reverse');
            assert.deepEqual(config.params, { lat: 14, lon: -87, format: 'json', addressdetails: 1 });
            assert.equal(config.withCredentials, false);
            assert.equal(config.signal, signal);
            return { data: { address: { state: 'Departamento', municipality: 'Municipio' } },
                status: 200, statusText: 'OK', headers: {}, config };
        };
        assert.deepEqual(await reverseGeocode(14, -87, signal), { department: 'Departamento', municipality: 'Municipio' });
    });

    await t.test('conserva la prioridad municipality, town y city', async () => {
        for (const [address, expected] of [
            [{ municipality: 'Municipio', town: 'Pueblo', city: 'Ciudad' }, 'Municipio'],
            [{ municipality: '', town: 'Pueblo', city: 'Ciudad' }, 'Pueblo'],
            [{ municipality: null, town: 3, city: 'Ciudad' }, 'Ciudad'],
        ]) {
            resolveWith({ address: { state: 'Departamento', ...address } });
            assert.equal((await reverseGeocode(14, -87, new AbortController().signal)).municipality, expected);
        }
    });

    await t.test('normaliza respuestas vacías, parciales y malformadas sin undefined', async () => {
        for (const data of [null, [], 'Invalid response', {}, { error: 'Not found' }, { address: [] },
            { address: { state: 3, municipality: {} } }]) {
            resolveWith(data);
            assert.deepEqual(await reverseGeocode(14, -87, new AbortController().signal), { department: '', municipality: '' });
        }
        resolveWith({ address: { state: 'Departamento' } });
        assert.deepEqual(await reverseGeocode(14, -87, new AbortController().signal), { department: 'Departamento', municipality: '' });
    });

    await t.test('el fallo de transporte llega al hook sin convertirse en éxito', async () => {
        const failure = new Error('Network Error');
        axios.defaults.adapter = async () => { throw failure; };
        await assert.rejects(reverseGeocode(14, -87, new AbortController().signal), error => error === failure);
    });

    await t.test('una señal ya cancelada impide iniciar el transporte', async () => {
        const controller = new AbortController();
        controller.abort();
        let calls = 0;
        axios.defaults.adapter = async () => { calls++; throw new Error('Must not execute'); };
        await assert.rejects(reverseGeocode(14, -87, controller.signal), error => axios.isCancel(error));
        assert.equal(calls, 0);
    });

    await t.test('cancelar descarta una respuesta tardía aunque el transporte resuelva', async () => {
        const controller = new AbortController();
        let finish;
        axios.defaults.adapter = config => new Promise(resolve => {
            finish = () => resolve({ data: { address: { state: 'Old', city: 'Old' } },
                status: 200, statusText: 'OK', headers: {}, config });
        });
        const request = reverseGeocode(14, -87, controller.signal);
        const rejected = assert.rejects(request, error => axios.isCancel(error));
        controller.abort();
        finish();
        await rejected;
    });
});
