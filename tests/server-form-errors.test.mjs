import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('errores de formulario: solo campos admitidos y mensajes generales recuperables', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `form-errors-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    });
    t.after(() => server.close());
    const { setServerFormErrors } = await server.ssrLoadModule('/src/helpers/setServerFormErrors.ts');
    const apply = error => {
        const calls = [];
        setServerFormErrors(error, (name, value) => calls.push([name, value]), ['nombre']);
        return calls;
    };
    await t.test('mezcla campos conocidos, desconocidos y rutas anidadas sin registrar estas últimas', () => {
        const calls = apply({ error: { nombre: ['Repetido', 'Prueba otro'], desconocido: ['General'],
            'nombre.interno': ['Anidado'], constructor: ['Clave desconocida'] } });
        assert.deepEqual(calls.map(([name]) => name), ['root.server', 'nombre']);
        assert.equal(calls[0][1].message, 'Repetido Prueba otro General Anidado Clave desconocida');
        assert.equal(calls[1][1].message, 'Repetido Prueba otro');
        assert.ok(calls.every(([, error]) => error.type === 'server'));
    });
    await t.test('errores generales, de conexión y desconocidos quedan visibles', () => {
        for (const error of [{ error: 'No disponible' }, { isAxiosError: true }, new Error('interno'),
            { error: { campoAjeno: ['General'] } }]) {
            const calls = apply(error);
            assert.equal(calls.length, 1);
            assert.equal(calls[0][0], 'root.server');
            assert.ok(calls[0][1].message.length > 0);
        }
    });
    await t.test('reintento aplica la causa nueva sin convertir claves desconocidas en campos', () => {
        assert.equal(apply({ error: 'Primero' })[0][1].message, 'Primero');
        assert.equal(apply({ error: { ajeno: ['Segundo'] } })[0][1].message, 'Segundo');
    });
});
