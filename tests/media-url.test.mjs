import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('medios: resolución de referencias sin modificar el contrato almacenado', async t => {
    const server = await createServer({
        configFile: false, cacheDir: join(tmpdir(), 'graphdata-tests', `media-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    });
    t.after(() => server.close());
    const { getMediaUrl } = await server.ssrLoadModule('/src/helpers/getMediaUrl.ts');
    await t.test('base pública, barras y caracteres; referencias absolutas e independientes del API', () => {
        const reference = 'drug/foto de prueba.png';
        for (const base of ['http://localhost/storage', 'http://localhost/storage/']) {
            assert.equal(getMediaUrl(reference, base), 'http://localhost/storage/drug/foto%20de%20prueba.png');
            assert.equal(getMediaUrl('/storage/drug/foto.png', base), 'http://localhost/storage/drug/foto.png');
        }
        assert.equal(reference, 'drug/foto de prueba.png');
        assert.equal(getMediaUrl('https://cdn.example.test/image.png?v=2', ''), 'https://cdn.example.test/image.png?v=2');
        assert.equal(getMediaUrl('weaponConfiscation/foto.png', 'https://media.example.test/uploads'),
            'https://media.example.test/uploads/weaponConfiscation/foto.png');
    });
    await t.test('ausencia/configuración inválida no produce peticiones relativas ni undefined', () => {
        for (const base of ['', '  ', null, 'undefined', '/storage', 'ftp://localhost/storage']) {
            assert.equal(getMediaUrl('drug/foto.png', base), undefined);
        }
        for (const reference of [undefined, null, '', '  ', 3, {}, 'javascript:alert(1)', 'data:image/png;base64,abc']) {
            assert.equal(getMediaUrl(reference, 'http://localhost/storage'), undefined);
        }
    });
});
