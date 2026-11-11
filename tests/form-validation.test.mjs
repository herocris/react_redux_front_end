import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { zodResolver } from '@hookform/resolvers/zod';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('los formularios convierten errores de Zod en errores de campo', async t => {
    const server = await createServer({
        configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `validation-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false },
        appType: 'custom',
    });
    t.after(() => server.close());
    const { authLoginSchema, authRegisterSchema } = await server.ssrLoadModule('/src/modules/auth/validators/authValidations.ts');
    const { userSchema } = await server.ssrLoadModule('/src/modules/user/validators/userValidations.ts');
    const resolve = (schema, values) => zodResolver(schema)(values, undefined, {
        fields: {}, shouldUseNativeValidation: false,
    });

    await t.test('registro vacío devuelve errores de campo sin lanzar ZodError', async () => {
        const result = await resolve(authRegisterSchema, { name: '', email: '', password: '', passwordConfirmation: '' });
        assert.deepEqual(result.values, {});
        for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
            assert.equal(typeof result.errors[field]?.message, 'string', field);
        }
    });

    await t.test('contraseñas distintas sitúan el error en la confirmación', async () => {
        const result = await resolve(authRegisterSchema, {
            name: 'Prueba', email: 'test@example.test', password: 'Password123!', passwordConfirmation: 'Other123!',
        });
        assert.equal(result.errors.passwordConfirmation.message, 'Las contraseñas no coinciden');
    });

    await t.test('login vacío y usuario inválido devuelven errores', async () => {
        const login = await resolve(authLoginSchema, { email: '', password: '' });
        assert.equal(typeof login.errors.email.message, 'string');
        assert.equal(typeof login.errors.password.message, 'string');
        const user = await resolve(userSchema, { nombre: '', correo: 'invalid', password: 'short' });
        for (const field of ['nombre', 'correo', 'password']) assert.equal(typeof user.errors[field]?.message, 'string');
    });

    await t.test('los datos válidos conservan sus campos y valores para el backend', async () => {
        const cases = [
            [authLoginSchema, { email: 'test@example.test', password: 'Password123!' }],
            [authRegisterSchema, { name: 'Prueba', email: 'test@example.test', password: 'Password123!', passwordConfirmation: 'Password123!' }],
            [userSchema, { identificador: 7, nombre: 'Prueba', correo: 'test@example.test', password: 'Password123!', roles: [], permisos: [] }],
        ];
        for (const [schema, values] of cases) {
            const result = await resolve(schema, values);
            assert.deepEqual(result.errors, {});
            assert.deepEqual(result.values, values);
        }
    });

    await t.test('los decomisos convierten entradas numéricas de texto y conservan la foto', async () => {
        const cases = [
            ['ammunitionConfiscation', 'ammunitionConfiscationSchema', { cantidad: '2', municion: '3' }],
            ['weaponConfiscation', 'weaponConfiscationSchema', { cantidad: '2', arma: '3' }],
            ['drugConfiscation', 'drugConfiscationSchema', { cantidad: '2', peso: '1.5', droga: '3', presentacion: '4' }],
        ];
        for (const [domain, name, fields] of cases) {
            const module = await server.ssrLoadModule(`/src/modules/${domain}/validators/${domain}Validations.ts`);
            const photo = new File(['image'], 'test.png', { type: 'image/png' });
            const result = await resolve(module[name], { ...fields, decomiso: 7, foto: photo });
            assert.deepEqual(result.errors, {});
            for (const [field, value] of Object.entries(fields)) assert.equal(result.values[field], Number(value));
            assert.equal(result.values.foto, photo);
            assert.equal(result.values.decomiso, 7);
            const invalid = await resolve(module[name], { ...fields, cantidad: '0', decomiso: 7, foto: photo });
            assert.equal(invalid.errors.cantidad.message, 'Debe haber al menos uno');
        }
    });

    await t.test('las fechas se mantienen como YYYY-MM-DD en el decomiso', async () => {
        const { confiscationSchema } = await server.ssrLoadModule('/src/modules/confiscation/validators/confiscationValidations.ts');
        const fields = { fecha: new Date(2026, 10, 7), observacion: 'Prueba', direccion: 'Prueba',
            departamento: 'Prueba', municipalidad: 'Prueba', latitud: 14, longitud: -87 };
        const valid = await resolve(confiscationSchema, fields);
        assert.deepEqual(valid.errors, {});
        assert.deepEqual(valid.values, { ...fields, fecha: '2026-11-07' });
        const invalid = await resolve(confiscationSchema, { ...fields, fecha: null });
        assert.equal(invalid.errors.fecha.message, 'La fecha es requerida');
    });
});
