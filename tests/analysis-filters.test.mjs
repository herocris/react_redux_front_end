import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('filtros aplicados: transiciones, contrato y fronteras de sesión', async t => {
    const server = await createServer({ configFile: false,
        cacheDir: join(tmpdir(), 'graphdata-tests', `analysis-filters-${process.pid}`),
        optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const load = path => server.ssrLoadModule(path);
    const { rootReducer } = await load('/src/store/store.ts');
    const { applyAnalysisFilters, resetAnalysisFilters, selectAppliedAnalysisFilters } =
        await load('/src/modules/analysisFilters/slices/analysisFiltersSlice.ts');
    const { onLogin, onLogout, onChecking } = await load('/src/modules/auth/slices/authSlice.ts');
    const empty = { start_date: '', end_date: '', drugs: [], weapons: [], ammunitions: [] };
    const filters = { start_date: '2026-01-02', end_date: '2026-11-09',
        drugs: ['007', 3], weapons: [8], ammunitions: ['12'] };
    const initial = () => rootReducer(undefined, { type: '@@init' });

    await t.test('defaults vacíos y selector estable; ninguna fecha ni selección implícita', () => {
        const state = initial();
        assert.deepEqual(selectAppliedAnalysisFilters(state), empty);
        assert.equal(selectAppliedAnalysisFilters(state), selectAppliedAnalysisFilters(state));
    });

    await t.test('editar borrador no aplica; aplicar reemplaza atómicamente sin convertir IDs ni fechas', () => {
        const before = initial();
        const draft = structuredClone(filters);
        draft.drugs.push('99');
        assert.deepEqual(selectAppliedAnalysisFilters(before), empty);
        const next = rootReducer(before, applyAnalysisFilters(draft));
        assert.deepEqual(selectAppliedAnalysisFilters(next), draft);
        assert.deepEqual(selectAppliedAnalysisFilters(before), empty);
        // The applied snapshot must not retain mutable form arrays.
        draft.drugs.push('later');
        assert.deepEqual(next.analysisFilters.drugs, ['007', 3, '99']);
        const replaced = rootReducer(next, applyAnalysisFilters({ ...filters, weapons: [] }));
        assert.deepEqual(replaced.analysisFilters, { ...filters, weapons: [] });
        assert.equal(replaced.auth, next.auth);
        assert.deepEqual(Object.keys(replaced).sort(), ['analysisFilters', 'auth']);
    });

    await t.test('solo filtros comunes serializables: sin opciones, archivos, resultados ni controles visuales', () => {
        const state = rootReducer(initial(), applyAnalysisFilters({ ...filters,
            typeGraph: 'pie', typeMap: 'hot', period: 2, typeConfiscation: 'Armas',
            options: [{ value: 1 }], results: [{ id: 1 }], file: new Blob(['test']) }));
        assert.deepEqual(state.analysisFilters, filters);
        assert.deepEqual(JSON.parse(JSON.stringify(state.analysisFilters)), filters);
        assert.deepEqual(rootReducer(state, resetAnalysisFilters()).analysisFilters, empty);
    });

    await t.test('logout, checking y login/cambio de usuario restablecen filtros; otras acciones los conservan', () => {
        const applied = rootReducer(initial(), applyAnalysisFilters(filters));
        assert.equal(rootReducer(applied, { type: 'unrelated' }).analysisFilters, applied.analysisFilters);
        const user = name => ({ nombre: name, correo: `${name}@example.test`, roles: [], permisos: [] });
        for (const action of [onLogout(), onChecking(), onLogin(user('A')), onLogin(user('B'))]) {
            const reset = rootReducer(applied, action);
            assert.deepEqual(reset.analysisFilters, empty, action.type);
        }
        assert.deepEqual(rootReducer(rootReducer(applied, onLogout()), applyAnalysisFilters(filters)).analysisFilters, filters);
    });
});
