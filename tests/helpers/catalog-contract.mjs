import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function catalogContractTests(domain, name) {
    test(domain + ': contratos HTTP, catálogo completo y validación', async t => {
        const server = await createServer({ configFile: false, cacheDir: join(tmpdir(), 'graphdata-tests', `${domain}-service-${process.pid}`),
            optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
        t.after(() => server.close());
        const load = p => server.ssrLoadModule(p);
        const { default: api } = await load('/src/api/graphdataApi.ts');
        const module = await load(`/src/modules/${domain}/services/${name}Service.ts`);
        const service = module[name + 'Service'];
        const original = api.defaults.adapter, originalEnv = api.defaults.env;
        api.defaults.env = { ...originalEnv, FormData };
        t.after(() => { api.defaults.adapter = original; api.defaults.env = originalEnv; });
        const image = !['rol', 'user'].includes(domain);
        const params = { page: 2, sortBy: 'id', orderType: 'desc', per_page: 5, search_by: 'nombre', valueSearch: 'texto' };
        const item = { id: 7, descripcion: 'Original', logo: 'old.png', nombre: 'Original', correo: 'test@example.test' };
        const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} });
        const body = (page, total = 3, ids = page === 1 ? [1, 2] : [3]) => ({
            data: ids.map(identificador => ({ identificador, descripcion: identificador, nombre: identificador, logo: 'old.png' })),
            total, current_page: page, last_page: 2, per_page: 2,
        });
        await t.test('listado conserva parámetros, metadatos, cookies e identificadores sin coerción', async () => {
            const controller = new AbortController();
            api.defaults.adapter = async config => {
                assert.equal(config.url, `/${name}?page=2&sort_by=identificador&type=desc&per_page=5&nombre=texto`);
                assert.equal(config.method, 'get'); assert.equal(config.withCredentials, true); assert.equal(config.signal.aborted, false);
                const { id, ...rest } = item;
                return reply(config, { ...body(2), data: [{ identificador: 7, ...rest }] });
            };
            const result = await service.list(params, controller.signal);
            assert.equal(result.rows[0].id, 7); assert.equal(result.tableOptions.total, 3);
            assert.equal(result.rows[0].logo, 'old.png');
        });
        await t.test('escrituras preservan JSON o multipart, imágenes y relaciones heredadas', async () => {
            for (const update of [false, true]) {
                for (const logo of ['old.png', new File(['image'], 'new.png', { type: 'image/png' })]) {
                    for (const relations of [[], [1, 2]]) {
                        const values = { ...item, logo, permisos: relations, roles: relations };
                        api.defaults.adapter = async config => {
                            assert.equal(config.url, `/${name}${update ? '/7' : ''}`);
                            assert.equal(config.method, image ? 'post' : update ? 'put' : 'post');
                            assert.equal(config.withCredentials, true);
                            if (image) {
                                assert.ok(config.data instanceof FormData);
                                assert.equal(config.data.get('descripcion'), values.descripcion);
                                if (update) {
                                    assert.equal(config.data.get('_method'), 'PUT');
                                    assert.equal(config.data.has('logo'), logo instanceof File);
                                    assert.deepEqual([...config.data.keys()].sort(), (logo instanceof File ? ['_method', 'descripcion', 'logo'] : ['_method', 'descripcion']).sort());
                                } else assert.equal(logo instanceof File ? config.data.get('logo').name : config.data.get('logo'), logo instanceof File ? 'new.png' : 'old.png');
                            } else {
                                assert.match(config.headers.get('Content-Type'), /application\/json/);
                                assert.deepEqual(JSON.parse(config.data), JSON.parse(JSON.stringify(values)));
                            }
                            return reply(config, { identificador: 7, nombre: values.nombre, descripcion: values.descripcion, logo: 'old.png', permisos: relations, roles: relations });
                        };
                        const result = await service[update ? 'update' : 'create'](values);
                        assert.equal(result.id, 7); assert.deepEqual(result.permisos, relations);
                    }
                }
            }
            api.defaults.adapter = async config => { assert.equal(config.method, 'delete'); assert.equal(config.url, `/${name}/7`); return reply(config, {}); };
            assert.equal(await service.remove(7), undefined);
        });
        await t.test('las cuatro operaciones conservan causas y permiten reintentar', async () => {
            for (const reason of [new axios.AxiosError('Network Error', 'ERR_NETWORK'), { error: { nombre: ['Duplicado'] } }, null]) {
                for (const call of [() => service.list(params), () => service.create(item), () => service.update(item), () => service.remove(7)]) {
                    api.defaults.adapter = async () => { throw reason; };
                    await assert.rejects(call(), error => error === reason);
                    api.defaults.adapter = async config => reply(config, { ...body(2), identificador: 7 });
                    await call();
                }
            }
        });
        await t.test('catálogo recorre todas las páginas con límite del servidor y acepta vacío', async () => {
            const pages = [];
            api.defaults.adapter = async config => {
                const url = new URL(config.url, 'http://test'); const page = Number(url.searchParams.get('page'));
                pages.push(page); assert.equal(url.searchParams.get('sort_by'), 'identificador');
                return reply(config, body(page));
            };
            assert.deepEqual((await service.catalog()).map(row => row.id), [1, 2, 3]); assert.deepEqual(pages, [1, 2]);
            api.defaults.adapter = async config => reply(config, { data: [], total: 0, current_page: 1, last_page: 1 });
            assert.deepEqual(await service.catalog(), []);
        });
        await t.test('rechaza catálogos parciales, duplicados, metadatos cambiantes y fallos de segunda página', async () => {
            for (const alter of [b => ({ ...b, total: undefined }), b => ({ ...b, last_page: undefined }), b => ({ ...b, current_page: 0 }),
                b => ({ ...b, total: 4 }), b => ({ ...b, data: [{ identificador: 1 }] }), b => ({ ...b, data: [] })]) {
                api.defaults.adapter = async config => { const page = Number(new URL(config.url, 'http://test').searchParams.get('page')); return reply(config, page === 1 ? body(1) : alter(body(2))); };
                await assert.rejects(service.catalog());
            }
            const reason = { error: 'segunda página' };
            api.defaults.adapter = async config => { if (config.url.includes('page=2')) throw reason; return reply(config, body(1)); };
            await assert.rejects(service.catalog(), error => error === reason);
            const controller = new AbortController();
            api.defaults.adapter = async config => { controller.abort(); return reply(config, body(1)); };
            await assert.rejects(service.catalog(controller.signal), axios.isCancel);
        });
        if (!image) await t.test('relaciones numéricas validadas sin coerción; rechaza elementos ajenos al contrato', async () => {
            const { [name + 'Schema']: schema } = await load(`/src/modules/${domain}/validators/${name === 'role' ? 'role' : 'user'}Validations.ts`);
            const base = name === 'user' ? { nombre: 'Nombre', correo: 'test@example.test', password: 'password-test' } : { nombre: 'Nombre' };
            for (const relations of [undefined, [], [1, 2]]) {
                const values = { ...base, ...(relations === undefined ? {} : { permisos: relations, ...(name === 'user' ? { roles: relations } : {}) }) };
                assert.deepEqual(schema.parse(values), values);
            }
            for (const value of [null, true, {}, [], '1', 0, -1, 1.5, { identificador: 1 }, { nombre: 'Leer', id: 1 }]) {
                assert.equal(schema.safeParse({ ...base, permisos: [value] }).success, false);
                if (name === 'user') assert.equal(schema.safeParse({ ...base, roles: [value] }).success, false);
            }
            assert.equal(schema.safeParse({ ...base, nombre: '' }).success, false);
        });
    });
}
