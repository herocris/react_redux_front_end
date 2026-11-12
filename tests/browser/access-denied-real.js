// P03: real local API; administrative page session, one temporary user, no role changes.
async (page) => {
    const check = (value, message) => { if (!value) throw new Error(message); };
    const passed = [], responses = [], errors = [];
    const api = 'http://localhost/api/';
    const context = await page.context().browser().newContext();
    let id;
    let cleaned = false;
    let last = 0;
    const request = async (ctx, method, path, data) => {
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1250 - (Date.now() - last))));
        last = Date.now();
        const response = await ctx.request.fetch(api + path, { method, data, maxRetries: 0,
            headers: { Accept: 'application/json' }, timeout: 15000 });
        const result = { status: response.status(), body: await response.json() };
        await response.dispose();
        return result;
    };
    try {
        const preflight = await request(page.context(), 'POST', 'refresh');
        check(preflight.status === 200 && ['user.create', 'user.delete'].every(p => preflight.body.permissions.includes(p)), 'Administrative session required');
        const tag = `PORTFOLIO_P03_${Date.now()}`;
        const password = await page.evaluate(() => `Audit!${crypto.randomUUID()}`);
        const account = { nombre: tag, correo: `${tag.toLowerCase()}@example.test`, password, roles: [], permisos: [] };
        const created = await request(page.context(), 'POST', 'user', account);
        id = created.body.identificador;
        check(created.status === 200 && Number.isSafeInteger(id), 'Temporary user setup failed');
        const anonymous = await request(context, 'GET', 'drug');
        check(anonymous.status === 401, 'Anonymous read must return 401');
        responses.push({ operation: 'anonymous read', ...anonymous });
        const login = await request(context, 'POST', 'login', { email: account.correo, password });
        check(login.status === 200 && login.body.permissions.length === 0, 'Temporary login must have no permissions');
        const denied = await request(context, 'GET', 'drug');
        check(denied.status === 403, 'Read must be forbidden');
        responses.push({ operation: 'authenticated read', ...denied });
        const write = await request(context, 'POST', 'drug', { descripcion: tag });
        check(write.status === 403, 'Write must be forbidden before validation');
        responses.push({ operation: 'authenticated write', ...write });
        passed.push('Real anonymous 401 and authenticated read/write 403 bodies');
        const view = await context.newPage();
        view.on('pageerror', error => errors.push(error.message));
        let refreshes = 0;
        view.on('request', req => { if (new URL(req.url()).pathname.endsWith('/refresh')) refreshes++; });
        await view.goto('http://localhost:5174/drug');
        const alert = view.getByRole('alert', { name: 'Acceso denegado' });
        await alert.waitFor();
        check(await alert.getByRole('link').count() === 0, 'Denial must not guess a permitted destination');
        await alert.getByRole('button', { name: 'Reintentar listado' }).focus();
        await view.keyboard.press('Tab');
        check(await alert.getByRole('button', { name: 'Cerrar sesión', exact: true }).evaluate(el => el === document.activeElement), 'Logout must be keyboard reachable');
        check(refreshes === 1 && view.url().endsWith('/drug'), '403 must not refresh or redirect');
        await alert.screenshot({ path: '.playwright-mcp/p03-access-denied-real.png' });
        passed.push('No-permission user: accessible denial, stable session/URL, explicit logout');
        await alert.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
        await view.waitForURL('**/auth/login');
        check(refreshes === 1, 'Logout unexpectedly refreshed');
        check(errors.length === 0, errors.join('; '));
        passed.push('Real logout remains available without a permitted view');
    } finally {
        await context.close();
        if (id !== undefined) {
            const removed = await request(page.context(), 'DELETE', `user/${id}`);
            cleaned = removed.status >= 200 && removed.status < 300;
            check(cleaned, 'Temporary user cleanup failed');
        }
    }
    return { passed, responses, cleaned, pageErrors: errors };
}
