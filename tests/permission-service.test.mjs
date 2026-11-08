import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('permissionService: contratos HTTP sin Redux', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `permission-service-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    });
    t.after(() => server.close());
    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const { permissionService: service } = await server.ssrLoadModule('/src/modules/permission/services/permissionService.ts');
    const original = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = original; });
    const success = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
    const params = { page: 3, sortBy: 'id', orderType: 'desc', per_page: 25, search_by: 'nombre', valueSearch: 'Leer' };

    await t.test('listado conserva parámetros, metadatos y mapea solo identificador', async () => {
        const metadata = { current_page: 3, per_page: 25, total: 52, last_page: 3, links: [], orderBy: 'nombre', order: 'desc', filterValue: 'Leer' };
        for (const sortBy of ['id', 'nombre']) {
            const input = { ...params, sortBy };
            const before = { ...input };
            const response = { ...metadata, data: [{ identificador: '007', nombre: 'Leer', extra: 'preservado' }] };
            api.defaults.adapter = async config => {
                assert.equal(config.method, 'get');
                assert.equal(config.url, `/permission?page=3&sort_by=${sortBy === 'id' ? 'identificador' : 'nombre'}&type=desc&per_page=25&nombre=Leer`);
                assert.equal(config.withCredentials, true);
                return success(config, response);
            };
            assert.deepEqual(await service.list(input), {
                permissions: [{ id: '007', nombre: 'Leer', extra: 'preservado' }], tableOptions: metadata,
            });
            assert.deepEqual(input, before);
            assert.equal(response.data[0].identificador, '007');
        }
        api.defaults.adapter = async config => {
            assert.equal(config.url, '/permission?page=1&sort_by=identificador&type=asc&per_page=10&=');
            return success(config, { ...metadata, total: 0, data: [] });
        };
        const empty = await service.list({ page: 1, sortBy: 'id', orderType: 'asc', per_page: 10, search_by: '', valueSearch: '' });
        assert.deepEqual(empty.permissions, []);
        assert.equal(empty.tableOptions.total, 0);
    });

    await t.test('crear y actualizar conservan JSON, cookies y ambos campos de identificador', async () => {
        for (const update of [false, true]) {
            for (const includeIdentifier of [false, true]) {
                const values = { nombre: 'Nuevo', ...(includeIdentifier ? { identificador: 'read' } : {}), ...(update ? { id: '007' } : {}) };
                const before = { ...values };
                api.defaults.adapter = async config => {
                    assert.equal(config.url, update ? '/permission/007' : '/permission');
                    assert.equal(config.method, update ? 'put' : 'post');
                    assert.equal(config.withCredentials, true);
                    assert.match(config.headers.get('Content-Type'), /application\/json/);
                    assert.deepEqual(JSON.parse(config.data), values);
                    return success(config, { identificador: '007', nombre: 'Nuevo' });
                };
                assert.deepEqual(await (update ? service.update(values) : service.create(values)), { id: '007', nombre: 'Nuevo' });
                assert.deepEqual(values, before);
            }
        }
    });

    await t.test('borrar conserva ruta e id y no necesita cuerpo de respuesta', async () => {
        api.defaults.adapter = async config => {
            assert.equal(config.method, 'delete');
            assert.equal(config.url, '/permission/007');
            assert.equal(config.withCredentials, true);
            assert.equal(config.data, undefined);
            return success(config, undefined);
        };
        assert.equal(await service.remove('007'), undefined);
    });

    const operations = [
        signal => service.list(params, signal),
        signal => service.create({ nombre: 'Leer' }, signal),
        signal => service.update({ id: '007', nombre: 'Leer' }, signal),
        signal => service.remove('007', signal),
    ];
    await t.test('propaga la causa HTTP, de red y desconocida sin reinterpretarla', async () => {
        for (const operation of operations) {
            for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: { nombre: ['Duplicado'] } }, null]) {
                api.defaults.adapter = async () => { throw reason; };
                await assert.rejects(operation(), error => error === reason);
            }
            const body = { error: 'No autorizado' };
            api.defaults.adapter = async config => {
                throw new axios.AxiosError('HTTP', 'ERR_BAD_RESPONSE', config, undefined, { ...success(config, body), status: 403 });
            };
            await assert.rejects(operation(), error => error === body);
        }
    });

    await t.test('las cuatro operaciones transmiten signal y rechazan respuestas tras aborto', async () => {
        for (const operation of operations) {
            const controller = new AbortController();
            let finish;
            let transportSignal;
            api.defaults.adapter = config => new Promise(resolve => {
                transportSignal = config.signal;
                finish = () => resolve(success(config, { identificador: '007', nombre: 'Leer', data: [] }));
            });
            const pending = operation(controller.signal);
            assert.equal(transportSignal.aborted, false);
            controller.abort();
            assert.equal(transportSignal.aborted, true);
            finish();
            await assert.rejects(pending, error => axios.isCancel(error));
        }
    });
});
