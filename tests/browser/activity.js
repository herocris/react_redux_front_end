async (page) => {
    const passed = [];
    const errors = [];
    const unexpectedConsole = [];
    const calls = [];
    const pending = new Set();
    let releaseRetry;
    const retryGate = new Promise(resolve => { releaseRetry = resolve; });
    let attempts = 0;
    let expectedNetworkErrors = 0;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const onError = () => errors.push('Unhandled page exception');
    const onConsole = message => {
        if (!['warning', 'error'].includes(message.type())) return;
        if (message.text().startsWith('Failed to load resource:') && message.location().url.includes('/activity')) expectedNetworkErrors++;
        else unexpectedConsole.push(message.type());
    };
    const rowData = { identificador: 7, tipo_de_evento: 'update', descripcion: 'Fixture', id_usuario: 4, usuario: 'Fixture', cambios: { antes: 1 }, fecha: '2026-11-08T12:13:14' };
    const response = (empty = false) => ({ data: empty ? [] : [rowData], current_page: 1, per_page: 10, total: empty ? 0 : 1, last_page: 1, orderBy: 'id', order: 'asc' });
    try {
        page.on('pageerror', onError);
        page.on('console', onConsole);
        page.setDefaultTimeout(10000);
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.route('**/*', async route => {
            const request = route.request();
            if (request.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
            if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
            const url = new URL(request.url());
            if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: { user: { name: 'Fixture', email: 'fixture@example.test' }, roles: [], permissions: ["activity"].flatMap(domain => (['dashboard', 'graph', 'map', 'activity'].includes(domain) ? ['view'] : ['view', 'create', 'update', 'delete']).map(action => domain + '.' + action)) } });
            if (url.pathname.endsWith('/activity')) {
                attempts++;
                calls.push({ method: request.method(), query: url.search });
                if (attempts === 2) return route.fulfill({ status: 500, json: { error: { fecha: ['Consulta temporalmente no disponible.'] } } });
                if (attempts === 3) {
                    pending.add(route);
                    try {
                        await retryGate;
                        return await route.fulfill({ json: response() });
                    } finally { pending.delete(route); }
                }
                if (attempts === 4) return route.abort('failed');
                return route.fulfill({ json: response(attempts >= 6) });
            }
            return route.fulfill({ json: { data: [] } });
        });
        await page.goto('http://127.0.0.1:4175/actividad');
        const row = page.getByRole('row').filter({ has: page.getByRole('gridcell', { name: 'Fixture', exact: true }) });
        await row.waitFor();
        check(attempts === 1, 'Duplicate initial load');
        check(await row.getByRole('gridcell', { name: '08-11-2026 12:13:14', exact: true }).count() === 1, 'Date format changed');
        check(await row.getByRole('gridcell', { name: '{"antes":1}', exact: true }).count() === 1, 'Changes serialization changed');
        check(await page.getByRole('menuitem', { name: /Editar|Borrar/ }).count() === 0 && await page.getByRole('button', { name: 'Añadir', exact: true }).count() === 0, 'Read-only contract changed');
        await row.getByRole('gridcell', { name: 'update', exact: true }).click();
        check(await row.getAttribute('aria-selected') === 'true', 'Row not selected');
        passed.push('one initial GET, fields, local date, serialized changes and read-only actions');

        const dateHeader = page.locator('[role="columnheader"][data-field="fecha"]');
        await dateHeader.click();
        await page.getByRole('alert').filter({ hasText: 'Consulta temporalmente no disponible.' }).waitFor();
        check(await row.getAttribute('aria-selected') === 'true', 'Selection lost after HTTP failure');
        check(calls[1].query.includes('sort_by=fecha') && calls[1].query.includes('type=asc'), 'Sort contract changed');
        await page.screenshot({ path: '.playwright-mcp/activity-error.png' });
        passed.push('HTTP field error visible, row and selection retained');

        await page.getByRole('button', { name: 'Reintentar carga' }).click();
        await page.getByRole('progressbar').waitFor();
        check(await row.count() === 1, 'Previous rows lost during retry');
        check(calls[2].query === calls[1].query, 'Retry changed parameters');
        check(attempts === 3, 'Retry duplicated request');
        releaseRetry();
        await page.getByRole('progressbar').waitFor({ state: 'hidden' });
        check(await row.getAttribute('aria-selected') === 'true', 'Selection lost after retry');
        passed.push('retry retains parameters and selection, clears error and finishes loading');

        await dateHeader.click();
        await page.getByRole('alert').filter({ hasText: 'No se pudo conectar con el servidor.' }).waitFor();
        check(await row.getAttribute('aria-selected') === 'true', 'Selection lost after network failure');
        await page.getByRole('button', { name: 'Reintentar carga' }).click();
        await page.getByRole('alert').waitFor({ state: 'hidden' });
        await page.getByRole('progressbar').waitFor({ state: 'hidden' });
        check(calls[3].query === calls[4].query, 'Network retry changed parameters');
        passed.push('network failure normalized and retry recovers without losing selection');

        // The original sort is still fresh in Query; make it stale to test a new empty response.
        await page.evaluate(async () => {
            const url = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === '/src/queries/queryClient.ts').name;
            const { queryClient } = await import(url);
            await queryClient.invalidateQueries({ queryKey: ['activity'], refetchType: 'none' });
        });
        await dateHeader.click();
        await row.waitFor({ state: 'hidden' });
        await page.getByRole('progressbar').waitFor({ state: 'hidden' });
        check(await page.getByRole('alert').count() === 0, 'Empty result shows stale error');
        check(attempts === 6 && calls.every(call => call.method === 'GET'), 'Unexpected request count or write');
        check(errors.length === 0 && unexpectedConsole.length === 0, 'Unexpected browser errors');
        passed.push('empty result, six GETs, no writes or unexpected console/page errors');
        return { passed, requests: attempts, expectedNetworkErrors, errors, unexpectedConsole };
    } finally {
        releaseRetry();
        await Promise.allSettled([...pending].map(route => route.abort()));
        await page.unrouteAll({ behavior: 'ignoreErrors' });
        page.off('pageerror', onError);
        page.off('console', onConsole);
        // The MCP caller must always close the browser in its own finally.
    }
}
