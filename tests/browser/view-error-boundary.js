// P08: production preview, isolated session/API and controlled route modules.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(12000);
    const base = 'http://127.0.0.1:4176';
    const passed = [], consoleErrors = [], pageErrors = [];
    let mode = 'render', refreshes = 0, logouts = 0, documents = 0, chunks = 0;
    let authenticated = true, httpError = false;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    view.on('pageerror', error => pageErrors.push(error.message));
    view.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 180));
    });
    view.on('request', request => { if (request.resourceType() === 'document') documents++; });
    await context.route('**/*', async route => {
        const request = route.request(), path = new URL(request.url()).pathname;
        if (/\/DrugRoutes-[^/]+\.js$/.test(path)) {
            chunks++;
            if (mode === 'import') return route.abort('failed');
            if (mode === 'render') return route.fulfill({ contentType: 'application/javascript', body:
                'export function DrugRoutes(){if(!window.__p08Recover)throw new Error("P08_PRIVATE_SENTINEL");return "Vista recuperada P08"}' });
        }
        if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
        if (path.endsWith('/refresh')) {
            refreshes++;
            return route.fulfill({ status: authenticated ? 200 : 401, json: authenticated
                ? { user: { name: 'P08', email: 'p08@example.test' }, roles: [], permissions: ['drug.view', 'weapon.view'] }
                : { message: 'Sin sesión' } });
        }
        if (path.endsWith('/logout')) { logouts++; authenticated = false; return route.fulfill({ json: {} }); }
        if (path.endsWith('/weapon') && httpError) return route.fulfill({ status: 500, json: { message: 'Error controlado' } });
        return route.fulfill({ json: { data: [], total: 0, current_page: 1, last_page: 1, per_page: 10 } });
    });
    const heading = view.getByRole('heading', { name: 'No se pudo mostrar esta vista' });
    const retry = view.getByRole('button', { name: 'Reintentar vista', exact: true });
    const verifyFallback = async () => {
        await heading.waitFor();
        check(await heading.evaluate(el => el === document.activeElement), 'Fallback heading lacks focus');
        check(!(await view.locator('body').innerText()).includes('P08_PRIVATE_SENTINEL'), 'Private exception exposed');
        check(await view.getByRole('alert').count() === 1, 'Missing accessible alert');
    };
    try {
        await view.goto(base + '/drug');
        await verifyFallback();
        const initialRefreshes = refreshes, initialDocuments = documents;
        await retry.click();
        await verifyFallback();
        check(await retry.count() === 0 && documents === initialDocuments, 'Repeated retry or automatic reload');
        await view.getByRole('link', { name: 'Ir a otra vista permitida' }).click();
        await view.getByRole('grid').waitFor();
        check(view.url().endsWith('/weapon') && refreshes === initialRefreshes && logouts === 0, 'Navigation lost session');
        await view.goBack();
        await verifyFallback();
        await view.evaluate(() => { window.__p08Recover = true; });
        await retry.click();
        await view.getByText('Vista recuperada P08', { exact: true }).waitFor();
        check(refreshes === initialRefreshes && documents === initialDocuments, 'Local retry restarted session/document');
        passed.push('Render failure: accessible generic fallback, one retry, persistent failure bounded, permitted navigation/back and transient recovery preserve session');

        mode = 'import';
        await view.goto(base + '/drug');
        await verifyFallback();
        const failedChunks = chunks, importDocuments = documents;
        await retry.click();
        await verifyFallback();
        check(chunks === failedChunks && documents === importDocuments && await retry.count() === 0, 'Cached import rejection retried or reload loop');
        await view.getByRole('link', { name: 'Ir a otra vista permitida' }).click();
        await view.getByRole('grid').waitFor();
        await view.goBack();
        await verifyFallback();
        mode = 'normal';
        await view.getByRole('button', { name: 'Recargar página', exact: true }).click();
        await view.getByRole('grid').waitFor();
        check(documents === importDocuments + 1 && chunks > failedChunks && logouts === 0, 'Explicit reload failed to recover authenticated lazy view');
        passed.push('Rejected production chunk: cached failure, other view/back, manual reload recovers real module without automatic reload');

        httpError = true;
        await view.goto(base + '/weapon');
        await view.getByRole('alert').filter({ hasText: 'Error del servidor' }).waitFor();
        check(await heading.count() === 0, 'Query HTTP error caught as render failure');
        httpError = false;
        await view.getByRole('button', { name: 'Reintentar listado' }).click();
        await view.getByRole('grid').waitFor();
        passed.push('HTTP 500 stays in Query error UI and its own retry recovers');

        mode = 'render';
        await view.goto(base + '/drug');
        await verifyFallback();
        await view.setViewportSize({ width: 375, height: 812 });
        check(await view.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile fallback overflows');
        await view.screenshot({ path: 'C:/Users/Ninfa Medina/AppData/Local/Temp/p08-mobile.png' });
        await view.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
        await view.locator('input[type="password"]').waitFor();
        check(logouts === 1, 'Fallback logout failed');
        passed.push('Mobile fallback fits; explicit logout reaches login');
        check(pageErrors.length === 0, 'Unhandled page error: ' + pageErrors.join('; '));
        check(consoleErrors.every(message => /P08_PRIVATE_SENTINEL|Failed to fetch dynamically imported module|Failed to load resource/.test(message)), 'Unexpected console error: ' + consoleErrors.join('; '));
        return { passed, pageErrors, expectedConsoleErrors: consoleErrors.length, refreshes, logouts };
    } finally {
        await context.close();
    }
}
