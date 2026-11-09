import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

// Retained helper infrastructure is removed in step 15. Domain concurrency
// coverage now lives in the Query tests, including confiscation-save.
test('helper antiguo: exclusividad por dispatch y limpieza', async t => {
    const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
        server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
    t.after(() => server.close());
    const { createLatestListRequest } = await server.ssrLoadModule('/src/api/latestListRequest.ts');
    const begin = createLatestListRequest();
    const firstStore = () => {}, secondStore = () => {};
    const old = begin(firstStore);
    const current = begin(firstStore);
    assert.equal(old.signal.aborted, true);
    assert.equal(old.isCurrent(), false);
    assert.equal(old.finish(), false);
    assert.equal(current.isCurrent(), true);
    const other = begin(secondStore);
    assert.equal(current.signal.aborted, false);
    assert.equal(other.isCurrent(), true);
    assert.equal(current.finish(), true);
    assert.equal(current.isCurrent(), false);
    const controller = new AbortController();
    const external = begin(firstStore, controller.signal);
    controller.abort();
    assert.equal(external.signal.aborted, true);
    assert.equal(external.isCurrent(), false);
    assert.equal(external.finish(), true);
    other.finish();
});
