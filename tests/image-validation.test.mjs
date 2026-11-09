import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { zodResolver } from '@hookform/resolvers/zod';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('imágenes: límites efectivos y referencias existentes', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `images-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    });
    t.after(() => server.close());
    const cases = [
        ['drug', 'logo', { descripcion: 'Droga' }],
        ['weapon', 'logo', { descripcion: 'Arma' }],
        ['ammunition', 'logo', { descripcion: 'Munición' }],
        ['drugPresentation', 'logo', { descripcion: 'Presentación' }],
        ['drugConfiscation', 'foto', { cantidad: 2, peso: 1.5, decomiso: 7, droga: 3, presentacion: 4 }],
        ['weaponConfiscation', 'foto', { cantidad: 2, decomiso: 7, arma: 3 }],
        ['ammunitionConfiscation', 'foto', { cantidad: 2, decomiso: 7, municion: 3 }],
    ];
    const resolve = (schema, values) => zodResolver(schema)(values, undefined, {
        fields: {}, shouldUseNativeValidation: false,
    });

    for (const [domain, field, fields] of cases) {
        const { [domain + 'Schema']: schema } = await server.ssrLoadModule(`/src/modules/${domain}/validators/${domain}Validations.ts`);
        await t.test(`${domain}: cero, mínimo, frontera y exceso; referencia y ausencia`, async () => {
            for (const size of [0, 1, 4_999_999, 5_000_000, 5_000_001]) {
                const file = new File([new Uint8Array(size)], 'imagen.png', { type: 'image/png' });
                const result = await resolve(schema, { ...fields, [field]: file });
                if (size === 0 || size > 5_000_000) {
                    assert.deepEqual(result.values, {});
                    assert.equal(result.errors[field]?.message, size === 0 ? 'El archivo no puede estar vacío' : 'Max size exceeded');
                } else {
                    assert.deepEqual(result.errors, {});
                    assert.equal(result.values[field], file, `size=${size}`);
                }
            }
            // No new MIME, extension or URL restrictions: these were not required.
            for (const image of ['existente.png', '/storage/fotos/imagen.jpg', 'https://example.test/imagen.png',
                new File(['datos'], 'sin-extension'), new File(['datos'], 'archivo.bin', { type: 'application/octet-stream' })]) {
                const input = { ...fields, [field]: image };
                const result = await resolve(schema, input);
                assert.deepEqual(result.errors, {});
                assert.deepEqual(result.values, input);
                assert.equal(result.values[field], image);
            }
            for (const image of ['', undefined, null, { size: 1, name: 'falso.png' }]) {
                const result = await resolve(schema, { ...fields, [field]: image });
                assert.deepEqual(result.values, {});
                assert.equal(typeof result.errors[field]?.message, 'string');
            }
        });
    }

    const { default: api } = await server.ssrLoadModule('/src/api/graphdataApi.ts');
    const originalAdapter = api.defaults.adapter;
    t.after(() => { api.defaults.adapter = originalAdapter; });
    for (const [domain, field, fields] of cases.filter(([, field]) => field === 'foto')) {
        await t.test(`${domain}: editar conserva la imagen o envía su reemplazo en multipart`, async () => {
            const { [domain + 'Schema']: schema } = await server.ssrLoadModule(`/src/modules/${domain}/validators/${domain}Validations.ts`);
            const { [domain + 'Service']: service } = await server.ssrLoadModule(`/src/modules/${domain}/services/${domain}Service.ts`);
            for (const image of ['existente.png', new File([new Uint8Array(5_000_000)], 'reemplazo.png')]) {
                const input = schema.parse({ ...fields, identificador: '8', [field]: image });
                let requests = 0;
                api.defaults.adapter = async config => {
                    requests++;
                    assert.equal(config.url, `/${domain}/8`);
                    assert.equal(config.method, 'post');
                    assert.equal(config.withCredentials, true);
                    assert.ok(config.data instanceof FormData);
                    assert.equal(config.data.get('_method'), 'PUT');
                    for (const [key, value] of Object.entries(fields)) assert.equal(config.data.get(key), String(value));
                    assert.equal(config.data.has(field), image instanceof File);
                    if (image instanceof File) {
                        const sent = config.data.get(field);
                        assert.equal(sent.name, image.name);
                        assert.equal(sent.size, image.size);
                    }
                    return { config, status: 200, statusText: 'OK', headers: {}, data: {
                        identificador: '8', foto: image instanceof File ? 'reemplazo.png' : image,
                        decomiso: { identificador: 7 }, droga: { identificador: 3, descripcion: 'Droga' },
                        presentacion: { identificador: 4, descripcion: 'Presentación' },
                        arma: { identificador: 3, descripcion: 'Arma' }, municion: { identificador: 3, descripcion: 'Munición' },
                    } };
                };
                await service.update(input);
                assert.equal(requests, 1);
            }
        });
    }
});
