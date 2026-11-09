async (page) => {
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const errors = [];
    const consoleErrors = [];
    const requests = [];
    let user = 'A';
    let logoutAttempts = 0;
    let expectedNetworkErrors = 0;
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    let delayedStarted;
    const started = new Promise(resolve => { delayedStarted = resolve; });
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (message.text().startsWith('Failed to load resource:') && message.location().url.endsWith('/logout')) {
            expectedNetworkErrors++;
            return;
        }
        if (['error', 'warning'].includes(message.type()) &&
            !message.text().startsWith('Canvas2D: Multiple readback operations')) {
            consoleErrors.push(message.text().slice(0, 200));
        }
    };
    const routeHandler = async route => {
        const request = route.request();
        if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
        const url = new URL(request.url());
        requests.push({ path: url.pathname, method: request.method(), user });
        if (/\/(refresh|login)$/.test(url.pathname)) return route.fulfill({ json: {
            user: { name: `Usuario ${user}`, email: `${user}@example.test` }, roles: [], permissions: [],
        } });
        if (url.pathname.endsWith('/logout')) {
            logoutAttempts++;
            return logoutAttempts === 1
                ? route.fulfill({ status: 503, json: { error: 'Salida rechazada de prueba.' } })
                : route.fulfill({ json: {} });
        }
        if (url.pathname.endsWith('/permission')) {
            const requestUser = user;
            if (requestUser === 'A' && url.searchParams.get('page') === '2') {
                delayedStarted();
                await gate;
            }
            // A cancelled HTTP request can no longer be fulfilled by the browser.
            await route.fulfill({ json: {
                data: [{ identificador: requestUser, nombre: `Permiso ${requestUser}` }],
                current_page: Number(url.searchParams.get('page') || 1), per_page: 10,
                total: 11, last_page: 2, orderBy: 'id', order: 'asc',
            } }).catch(error => {
                if (!/cancel|closed|already handled|Invalid InterceptionId/i.test(error.message)) throw error;
            });
            return;
        }
        return route.fulfill({ json: { data: [], total: 0 } });
    };
    page.on('pageerror', onError);
    page.on('console', onConsole);
    page.setDefaultTimeout(10000);
    await page.route('**/*', routeHandler);
    try {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto('http://127.0.0.1:4175/permiso');
        await page.getByText('Permiso A', { exact: true }).waitFor();
        await page.evaluate(async () => {
            // Reuse Vite's loaded URL, including its HMR timestamp. Importing
            // an unversioned URL can create a second store/client after edits.
            const url = performance.getEntriesByType('resource').find(entry =>
                new URL(entry.name).pathname === '/src/queries/queryClient.ts').name;
            const { queryClient } = await import(url);
            queryClient.setQueryData(['session-browser-probe'], 'A');
        });
        const failedLogout = page.waitForResponse(response => response.url().endsWith('/logout') && response.status() === 503);
        await page.locator('button').filter({ has: page.locator('[data-testid="LogoutIcon"]') }).click();
        await failedLogout;
        check(await page.getByText('Permiso A', { exact: true }).count() === 1, 'Logout fallido conserva listado');
        await page.getByRole('button', { name: 'Go to next page' }).click();
        await started;
        await page.locator('button').filter({ has: page.locator('[data-testid="LogoutIcon"]') }).click();
        await page.waitForURL('**/auth/login');
        const clean = await page.evaluate(async () => {
            const moduleURL = path => performance.getEntriesByType('resource').find(entry =>
                new URL(entry.name).pathname === path).name;
            const { store } = await import(moduleURL('/src/store/store.ts'));
            const { queryClient } = await import(moduleURL('/src/queries/queryClient.ts'));
            const state = store.getState();
            return { remoteDomains: Object.keys(state).filter(key => !['auth', 'analysisFilters'].includes(key)).length,
                appliedFilters: Object.values(state.analysisFilters).reduce((count, value) => count + value.length, 0),
                queries: queryClient.getQueryCache().getAll().length,
                mutations: queryClient.getMutationCache().getAll().length };
        });
        check(Object.values(clean).every(count => count === 0), 'Salida limpia Redux y Query');
        user = 'B';
        await page.getByRole('textbox', { name: 'Correo', exact: true }).fill('B@example.test');
        await page.locator('input[name="password"]').fill('Password123!');
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.waitForURL('**/dashboard');
        await page.getByText('Usuario B', { exact: true }).first().waitFor();
        await page.getByRole('button', { name: 'Permission', exact: true }).click();
        await page.getByText('Permiso B', { exact: true }).waitFor();
        release();
        await page.waitForFunction(async () => {
            const url = performance.getEntriesByType('resource').find(entry =>
                new URL(entry.name).pathname === '/src/store/store.ts').name;
            const { store } = await import(url);
            const clientURL = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === '/src/queries/queryClient.ts').name;
            const { queryClient } = await import(clientURL);
            return queryClient.getQueryCache().findAll({ queryKey: ['permission', 'list'] }).some(query => query.state.data?.permissions[0]?.id === 'B') && !('permission' in store.getState());
        });
        check(await page.getByText('Permiso A', { exact: true }).count() === 0, 'No reaparecen filas de A');
        check(errors.length === 0, JSON.stringify(errors));
        check(consoleErrors.length === 0, JSON.stringify(consoleErrors));
        return { passed: ['listado de permisos migrado a Query', 'logout fallido conserva sesión sin rechazo sin manejar', 'salida limpia Redux y Query con lectura pendiente',
            'acceso B y respuesta tardía A sin contaminación'], requests,
            cleanAfterLogout: clean, pageErrors: errors.length, unexpectedConsole: consoleErrors.length, expectedNetworkErrors };
    } finally {
        release();
        await page.unroute('**/*', routeHandler);
        page.off('pageerror', onError);
        page.off('console', onConsole);
    }
}
