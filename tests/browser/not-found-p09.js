// P09: real production routes/components, isolated simulated session and API.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(10000);
    const base = 'http://127.0.0.1:4176';
    const passed = [], pageErrors = [], consoleErrors = [], dataRequests = [];
    let authenticated = false, permissions = ['drug.view'], logoutFails = false;
    let detailStatus = 404, logouts = 0;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const session = () => ({ user: { name: 'P09', email: 'p09@example.test' }, roles: [], permissions });
    view.on('pageerror', error => pageErrors.push(error.message));
    view.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 160)); });
    await context.route('**/*', async route => {
        const request = route.request(), path = new URL(request.url()).pathname;
        if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
        if (path.endsWith('/refresh')) return route.fulfill({ status: authenticated ? 200 : 401,
            json: authenticated ? session() : { message: 'Sin sesión' } });
        if (path.endsWith('/login')) { authenticated = true; return route.fulfill({ json: session() }); }
        if (path.endsWith('/logout')) {
            logouts++;
            if (logoutFails) return route.fulfill({ status: 500, json: {} });
            authenticated = false;
            return route.fulfill({ json: {} });
        }
        dataRequests.push(path);
        if (/\/confiscation\/\d+$/.test(path)) return route.fulfill({ status: detailStatus, json: { message: 'Controlled resource failure' } });
        return route.fulfill({ json: { data: [], total: 0, current_page: 1, last_page: 1, per_page: 10 } });
    });
    const heading = view.getByRole('heading', { name: 'Página no encontrada', exact: true });
    const missing = async path => {
        const count = dataRequests.length;
        const response = await view.goto(base + path);
        await heading.waitFor();
        check(new URL(view.url()).pathname === path.split('?')[0], 'Unknown URL redirected: ' + path);
        check(dataRequests.length === count, 'Unknown URL mounted data consumers: ' + path);
        check(await heading.evaluate(el => document.activeElement === el), 'Missing heading focus');
        return response.status();
    };
    try {
        const documentStatus = await missing('/p09-inexistente?origen=directo');
        await view.reload();
        await heading.waitFor();
        check(new URL(view.url()).pathname === '/p09-inexistente', 'Reload redirected');
        await view.getByRole('link', { name: 'Ir al acceso' }).click();
        await view.locator('input[type="password"]').waitFor();
        await view.goBack();
        await heading.waitFor();
        await view.goForward();
        await view.locator('input[type="password"]').waitFor();
        passed.push('Visitor direct URL/reload keeps address; login link, browser back and forward recover');

        const modules = ['user', 'dashboard', 'rol', 'permiso', 'actividad', 'ammunition', 'drug', 'weapon', 'drugPresentation', 'confiscation', 'auth'];
        for (const module of modules) await missing('/' + module + '/p09/desconocida');
        for (const path of ['/map/p09', '/graph/p09', '/confiscation/edit/7/extra', '/confiscation/create/extra']) await missing(path);
        passed.push('Visitor unknown nested URLs: all 11 module wildcards, graph/map and confiscation extras give 404 without data requests');

        for (const path of ['/', '/auth', '/drug', '/confiscation/create']) {
            await view.goto(base + path);
            await view.locator('input[type="password"]').waitFor();
            check(new URL(view.url()).pathname === '/auth/login', 'Visitor entry/private URL failed: ' + path);
        }
        await view.goto(base + '/auth/register');
        await view.getByRole('textbox', { name: 'Nombre' }).waitFor();
        await view.goto(base + '/auth/login');
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
        await view.getByRole('grid').waitFor();
        check(new URL(view.url()).pathname === '/drug', 'Login did not land on allowed view');
        passed.push('Deliberate visitor root/auth/private login and registration entries preserved; simulated login reaches permitted drug list');

        for (const path of ['/', '/auth', '/auth/login', '/auth/register']) {
            await view.goto(base + path);
            await view.getByRole('grid').waitFor();
            check(new URL(view.url()).pathname === '/drug', 'Authenticated entry failed: ' + path);
        }
        for (const module of modules) await missing('/' + module + '/p09/desconocida');
        check(await view.getByRole('link', { name: 'Ir a una vista permitida' }).getAttribute('href') === '/drug', 'Unsafe recovery link');
        await view.getByRole('link', { name: 'Ir a una vista permitida' }).click();
        await view.getByRole('grid').waitFor();
        await view.goBack();
        await heading.waitFor();
        passed.push('Authenticated entries go to allowed list; all module unknown URLs stay 404; recovery and back preserve session');

        const count = dataRequests.length;
        await view.goto(base + '/weapon');
        await view.getByRole('alert').filter({ hasText: 'Acceso denegado' }).waitFor();
        check(await heading.count() === 0 && dataRequests.length === count, 'Known forbidden route confused with 404 or fetched');
        await missing('/weapon/p09/desconocida');
        permissions = ['confiscation.view'];
        await view.goto(base + '/confiscation/detail/999999');
        await view.getByRole('alert').filter({ hasText: 'Recurso no encontrado' }).waitFor();
        check(await heading.count() === 0, 'Resource missing became route missing');
        detailStatus = 403;
        await view.getByRole('button', { name: 'Reintentar', exact: true }).click();
        await view.getByRole('alert').filter({ hasText: 'Acceso denegado' }).waitFor();
        check(await heading.count() === 0 && new URL(view.url()).pathname === '/confiscation/detail/999999', 'Resource 403 redirected');
        passed.push('Known forbidden route mounts no data; unknown forbidden prefix gives 404; existing detail URL keeps Query resource 404/403 distinct');

        permissions = [];
        await missing('/p09-sin-permisos');
        check(await view.getByRole('link').count() === 0, 'No-permissions user offered unauthorized destination');
        logoutFails = true;
        await view.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
        await view.getByRole('alert').filter({ hasText: 'No se pudo cerrar la sesión' }).waitFor();
        logoutFails = false;
        await view.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
        await view.getByRole('link', { name: 'Ir al acceso' }).waitFor();
        check(logouts === 2, 'Logout retried automatically');
        await view.getByRole('link', { name: 'Ir al acceso' }).click();
        await view.locator('input[type="password"]').waitFor();
        passed.push('No-permissions 404 offers logout only; failed logout retains session, explicit retry and visitor login recover');

        await view.setViewportSize({ width: 375, height: 812 });
        await missing('/p09-movil');
        check(await view.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile 404 overflow');
        await view.screenshot({ path: '.playwright-mcp/p09-mobile.png' });
        await view.setViewportSize({ width: 1280, height: 900 });
        await view.screenshot({ path: '.playwright-mcp/p09-desktop.png' });
        await view.evaluate(() => localStorage.setItem('themeMode', 'dark'));
        await view.reload();
        await heading.waitFor();
        const background = await view.locator('main').evaluate(el => getComputedStyle(el).backgroundColor);
        check(background === 'rgb(18, 18, 18)', 'Saved dark theme not applied');
        await view.screenshot({ path: '.playwright-mcp/p09-dark.png' });
        await view.keyboard.press('Tab');
        check(await view.getByRole('link', { name: 'Ir al acceso' }).evaluate(el => el === document.activeElement), 'Recovery link not keyboard reachable');
        await view.keyboard.press('Enter');
        await view.locator('input[type="password"]').waitFor();
        check(pageErrors.length === 0, 'Unexpected page errors: ' + pageErrors.join('; '));
        check(consoleErrors.every(message => /Failed to load resource/.test(message)), 'Unexpected console errors: ' + consoleErrors.join('; '));
        passed.push('Mobile 375px and desktop 1280px fit; heading focus verified; no unhandled JS exceptions');
        return { passed, documentStatus, pageErrors, expectedHttpConsoleErrors: consoleErrors.length, dataRequests: dataRequests.length, logouts };
    } finally { await context.close(); }
}
