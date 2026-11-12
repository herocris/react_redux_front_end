import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';

test('P04: permisos efectivos, dependencias y sesión', async t => {
    const server = await createServer({ configFile: false, cacheDir: join(tmpdir(), `access-${process.pid}`),
        ssr: { noExternal: ['@mui/icons-material'] },
        optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const { canAccess, firstAllowedPath, accessDestinations } = await server.ssrLoadModule('/src/modules/auth/access.ts');
    const { authSlice } = await server.ssrLoadModule('/src/modules/auth/slices/authSlice.ts');
    const { selectSessionUser } = await server.ssrLoadModule('/src/modules/auth/selectors.ts');
    const user = permisos => ({ nombre: 'Fixture', correo: 'fixture@example.test', permisos, roles: [] });
    const evidence = JSON.parse(await readFile(new URL('../docs/verification-access-control-p01-results-2026-11-10.json', import.meta.url)));
    const roles = evidence.batches.flatMap(batch => batch.roleCatalog);

    await t.test('perfiles completos observados en P01, sin reinterpretar el rol', () => {
        for (const name of ['administrador', 'operador', 'analista']) {
            const profile = user(roles.find(role => role.name === name).permissions);
            assert.equal(firstAllowedPath(profile), '/dashboard');
            for (const { domain } of accessDestinations) {
                assert.equal(canAccess(profile, domain), profile.permisos.includes(`${domain}.view`), `${name}: ${domain}`);
            }
            assert.equal(canAccess(profile, 'drug', 'create'), name !== 'analista');
            assert.equal(canAccess(profile, 'confiscation', 'delete'), name === 'administrador');
            assert.equal(canAccess(profile, 'drugConfiscation', 'update'), name !== 'analista');
        }
    });
    await t.test('permiso directo, ausencia de permisos y ausencia de bypass administrativo', () => {
        assert.equal(canAccess(user(['drug.view']), 'drug'), true);
        assert.equal(firstAllowedPath(user(['drug.view'])), '/drug');
        assert.equal(canAccess(user(['drug.create']), 'drug', 'create'), false);
        assert.equal(canAccess({ ...user([]), roles: ['administrador'] }, 'user'), false);
        assert.equal(firstAllowedPath(user([])), undefined);
        assert.equal(firstAllowedPath({ nombre: '', correo: '' }), undefined);
    });
    await t.test('catálogos requeridos para edición/análisis y panel de navegación independiente', () => {
        for (const [domain, catalogs] of [['user', ['role', 'permission']], ['role', ['permission']],
            ['drugConfiscation', ['drug', 'drugPresentation']], ['weaponConfiscation', ['weapon']], ['ammunitionConfiscation', ['ammunition']]]) {
            const base = [`${domain}.view`, `${domain}.create`, `${domain}.update`, `${domain}.delete`];
            assert.equal(canAccess(user(base), domain), true);
            assert.equal(canAccess(user(base), domain, 'delete'), true);
            for (const action of ['create', 'update']) {
                assert.equal(canAccess(user(base), domain, action), false);
                assert.equal(canAccess(user([...base, ...catalogs.map(item => `${item}.view`)]), domain, action), true);
            }
        }
        for (const domain of ['graph', 'map']) {
            assert.equal(canAccess(user([`${domain}.view`]), domain), false);
            assert.equal(canAccess(user([`${domain}.view`, 'drug.view', 'weapon.view', 'ammunition.view']), domain), true);
        }
        assert.equal(canAccess(user(['dashboard.view']), 'dashboard'), true);
        assert.equal(canAccess(user(['dashboard.view', 'drug.view', 'graph.view', 'map.view']), 'dashboard'), true);
    });
    await t.test('login, refresh y logout usan una sola sesión Redux', () => {
        const store = configureStore({ reducer: { auth: authSlice.reducer } });
        store.dispatch(authSlice.actions.onLogin(user(['drug.view'])));
        assert.equal(canAccess(selectSessionUser(store.getState()), 'drug'), true);
        store.dispatch(authSlice.actions.onLogin(user(['weapon.view'])));
        assert.equal(canAccess(selectSessionUser(store.getState()), 'drug'), false);
        assert.equal(canAccess(selectSessionUser(store.getState()), 'weapon'), true);
        store.dispatch(authSlice.actions.onLogout());
        assert.equal(firstAllowedPath(selectSessionUser(store.getState())), undefined);
        assert.deepEqual(Object.keys(store.getState()), ['auth']);
    });
    await t.test('guard de ruta: deniega antes de montar consumidores; conserva salida y exige acción', async () => {
        const { AccessRoute } = await server.ssrLoadModule('/src/router/AccessRoute.tsx');
        const { ThemeContext } = await server.ssrLoadModule('/src/theme/themeState.ts');
        const store = configureStore({ reducer: { auth: authSlice.reducer } });
        let mounts = 0;
        const Consumer = () => { mounts++; return h('p', null, 'protected consumer'); };
        const render = (permissions, action = 'view') => {
            store.dispatch(authSlice.actions.onLogin(user(permissions)));
            return renderToStaticMarkup(h(Provider, { store },
                h(ThemeContext.Provider, { value: { mode: 'light', toggleMode() {} } },
                    h(MemoryRouter, { initialEntries: ['/drug'] },
                        h(Routes, null, h(Route, { path: '/drug', element:
                            h(AccessRoute, { domain: 'drug', action }, h(Consumer)) }))))));
        };
        assert.match(render([]), /Acceso denegado/);
        assert.equal(mounts, 0);
        assert.match(render([]), /Cerrar sesión/);
        assert.match(render(['drug.view']), /protected consumer/);
        assert.equal(mounts, 1);
        assert.match(render(['drug.view'], 'create'), /Acceso denegado/);
        assert.equal(mounts, 1);
        assert.match(render(['drug.view', 'drug.create'], 'create'), /protected consumer/);
        assert.equal(mounts, 2);
    });
});
