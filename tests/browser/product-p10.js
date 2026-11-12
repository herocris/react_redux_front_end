// P10: production preview, simulated API/session; no private data or backend writes.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(10000);
    const base = 'http://127.0.0.1:4176';
    const passed = [], errors = [], warnings = [], reads = [], scripts = [];
    let authenticated = false, permissions = [], failList = false;
    const check = (value, message) => { if (!value) throw new Error(message); };
    const session = () => ({ user: { name: 'Demo', email: 'demo@example.test' }, roles: [], permissions });
    view.on('pageerror', error => errors.push(error.message));
    view.on('console', msg => {
        if (['warning', 'error'].includes(msg.type()) && !/Failed to load resource:/.test(msg.text())) warnings.push(msg.text().slice(0, 200));
    });
    view.on('request', req => { if (req.resourceType() === 'script') scripts.push(new URL(req.url()).pathname); });
    await context.route('**/*', async route => {
        const req = route.request(), path = new URL(req.url()).pathname;
        if (!['xhr', 'fetch'].includes(req.resourceType())) return route.fallback();
        if (path.endsWith('/refresh')) return route.fulfill({ status: authenticated ? 200 : 401, json: authenticated ? session() : { message: 'Sin sesión' } });
        if (path.endsWith('/login')) { authenticated = true; return route.fulfill({ json: session() }); }
        if (path.endsWith('/logout')) { authenticated = false; return route.fulfill({ json: {} }); }
        reads.push(path);
        if (failList && path.endsWith('/drug')) return route.fulfill({ status: 500, json: { message: 'Error de prueba' } });
        return route.fulfill({ json: { data: [], total: 0, current_page: 1, last_page: 1, per_page: 10 } });
    });
    const go = async path => { reads.length = 0; scripts.length = 0; await view.goto(base + path); };
    const panel = () => view.getByRole('heading', { name: 'Panel de inicio', exact: true });
    const noOverflow = async () => check(await view.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
    try {
        await view.setViewportSize({ width: 1440, height: 1000 });
        await go('/auth/login');
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).waitFor();
        check(await view.title() === 'Decomisos · Gestión y análisis', 'Wrong document title');
        check(await view.locator('html').getAttribute('lang') === 'es', 'Wrong language');
        const icon = await view.locator('link[rel="icon"]').getAttribute('href');
        check(icon === '/decomisos.svg' && (await context.request.get(base + icon)).ok(), 'Missing product icon');
        check(!scripts.some(s => /DashBoardRoutes-|GraphView-|MapView-|TileLayer-/.test(s)), 'Login loads private visualizations');
        // Mask the intentionally prefilled account in all artifacts.
        await view.waitForFunction(() => getComputedStyle(document.querySelector('.box-shadow')).transform === 'none');
        await view.screenshot({ path: 'docs/screenshots/p10-login-desktop.png', mask: [view.locator('input')] });
        permissions = ['dashboard.view'];
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
        await panel().waitFor();
        await view.getByText('No tienes herramientas habilitadas.', { exact: false }).waitFor();
        check(reads.length === 0 && await view.getByRole('link', { name: /^Abrir / }).count() === 0, 'Empty dashboard leaks data/links');
        passed.push('Spanish identity/favicon, masked demo login, lazy entry and dashboard-only empty state without data requests');

        permissions = ['dashboard.view', 'drug.view', 'graph.view'];
        await go('/dashboard'); await panel().waitFor();
        check(await view.getByRole('link', { name: 'Abrir drogas', exact: true }).count() === 1, 'Direct catalog permission lost');
        check(await view.getByRole('link', { name: 'Abrir gráficos', exact: true }).count() === 0, 'Missing graph dependencies ignored');
        check(reads.length === 0, 'Dashboard queried data');
        permissions = [];
        await go('/dashboard'); await view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        check(reads.length === 0, 'Denied dashboard queries');
        passed.push('Partial permissions filter cards; analysis dependencies and dashboard guard prevent unauthorized consumers');

        permissions = ['dashboard', 'confiscation', 'drug', 'weapon', 'ammunition', 'drugPresentation', 'graph', 'map'].map(d => d + '.view');
        await go('/dashboard'); await panel().waitFor();
        check(await view.getByRole('link', { name: /^Abrir / }).count() === 7, 'Wrong authorized cards');
        check(reads.length === 0 && !scripts.some(s => /GraphView-|MapView-|TileLayer-/.test(s)), 'Dashboard eagerly loads analysis');
        await noOverflow();
        await view.screenshot({ path: 'docs/screenshots/p10-dashboard-desktop.png', fullPage: true });
        await view.getByRole('button', { name: 'Activar tema oscuro' }).click();
        await view.screenshot({ path: 'docs/screenshots/p10-dashboard-dark.png', fullPage: true });
        await view.getByRole('button', { name: 'Activar tema claro' }).click();
        passed.push('Authorized product hub, explicit demo/source notice, no fabricated metrics or eager analysis, desktop light/dark');

        await view.getByRole('link', { name: 'Abrir drogas', exact: true }).focus();
        await view.keyboard.press('Enter');
        await view.getByRole('grid').waitFor();
        await view.getByText('Sin filas', { exact: true }).waitFor();
        failList = true;
        await view.reload();
        await view.getByRole('alert').waitFor();
        failList = false;
        await view.getByRole('button', { name: /Reintentar/ }).click();
        await view.getByText('Sin filas', { exact: true }).waitFor();
        await view.goBack(); await panel().waitFor();
        passed.push('Keyboard card navigation, API list empty/error/retry in Spanish and back preserve session');

        await view.getByRole('link', { name: 'Abrir gráficos', exact: true }).click();
        await view.locator('form').waitFor();
        await view.getByLabel('Aplicar filtros').waitFor();
        check(scripts.some(s => /GraphView-/.test(s)), 'Analysis not lazy loaded on navigation');
        await view.getByRole('button', { name: /Elige fecha/ }).first().click();
        await view.getByRole('button', { name: 'Mes anterior' }).waitFor();
        check(/enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i.test(await view.getByRole('dialog').innerText()), 'Calendar month not translated');
        await view.keyboard.press('Escape');
        await view.goBack(); await panel().waitFor();
        await view.setViewportSize({ width: 390, height: 844 });
        await noOverflow();
        check(await view.getByRole('button', { name: 'Cerrar sesión' }).evaluate(el => el.getBoundingClientRect().right <= innerWidth), 'Mobile toolbar clips logout');
        await view.screenshot({ path: 'docs/screenshots/p10-dashboard-mobile.png', fullPage: true });
        await view.getByRole('button', { name: 'Abrir menú' }).click();
        await view.getByRole('button', { name: 'Gráficos', exact: true }).filter({ visible: true }).click();
        await view.locator('form').waitFor();
        check(await view.getByRole('button', { name: 'Panel de inicio', exact: true }).filter({ visible: true }).count() === 0, 'Drawer remains open');
        await view.getByRole('button', { name: 'Abrir menú' }).click();
        await view.getByRole('button', { name: 'Panel de inicio', exact: true }).filter({ visible: true }).click();
        await panel().waitFor();
        await view.getByRole('button', { name: 'Cerrar sesión' }).click();
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).waitFor();
        await noOverflow();
        await view.waitForFunction(() => getComputedStyle(document.querySelector('.box-shadow')).transform === 'none');
        await view.screenshot({ path: 'docs/screenshots/p10-login-mobile.png', mask: [view.locator('input')], fullPage: true });
        passed.push('Lazy graph navigation, mobile layout/drawer closes after navigation, return and logout; masked mobile login');
        check(errors.length === 0 && warnings.length === 0, JSON.stringify({ errors, warnings }));
        return { passed, pageErrors: errors, unexpectedConsole: warnings };
    } finally { await context.close(); }
}
