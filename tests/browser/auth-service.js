async (page) => {
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const passed = [];
    const errors = [];
    const consoleErrors = [];
    let canvasWarnings = 0;
    let expectedNetworkErrors = 0;
    const writes = [];
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (message.text().startsWith('Canvas2D: Multiple readback operations')) {
            canvasWarnings++;
            return;
        }
        if (message.text().startsWith('Failed to load resource:') && /\/(refresh|login|register)$/.test(message.location().url)) {
            expectedNetworkErrors++;
            return;
        }
        if (['error', 'warning'].includes(message.type())) {
            consoleErrors.push(message.text().slice(0, 200));
        }
    };
    let release;
    let gate;
    let attempt = 0;
    let mode;
    const response = { user: { name: 'Sesión de prueba', email: 'session@example.test' }, roles: [], permissions: ['drug.view'] };
    const routeHandler = async route => {
        const request = route.request();
        if (!['xhr', 'fetch'].includes(request.resourceType())) return route.fallback();
        const path = new URL(request.url()).pathname;
        if (path.endsWith('/refresh')) return route.fulfill({ status: 401, json: { error: 'Sin sesión.' } });
        if (path.endsWith('/login') || path.endsWith('/register')) {
            writes.push({ path, method: request.method(), fields: Object.keys(request.postDataJSON()).sort() });
            attempt++;
            if (attempt === 1) {
                await gate;
                return route.fulfill({ status: 422, json: { error: 'Acceso de prueba rechazado.' } });
            }
            return route.fulfill({ json: mode === 'register'
                ? { user: { nombre: response.user.name, correo: response.user.email, roles: [], permisos: response.permissions } }
                : response });
        }
        if (path.endsWith('/logout')) return route.fulfill({ json: {} });
        return route.fulfill({ json: { data: [], total: 0 } });
    };
    page.on('pageerror', onError);
    page.on('console', onConsole);
    page.setDefaultTimeout(10000);
    await page.route('**/*', routeHandler);
    try {
        for (mode of ['login', 'register']) {
            attempt = 0;
            gate = new Promise(resolve => { release = resolve; });
            await page.goto(`http://127.0.0.1:4175/auth/${mode}`);
            if (mode === 'register') await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Sesión de prueba');
            await page.getByRole('textbox', { name: 'Correo', exact: true }).fill('session@example.test');
            await page.locator('input[name="password"]').fill('Password123!');
            if (mode === 'register') await page.locator('input[name="passwordConfirmation"]').fill('Password123!');
            await page.locator('form').evaluate(form => { window.authTestForm = form; });
            await page.getByRole('button', { name: 'Login', exact: true }).click();
            await page.waitForFunction(() => document.querySelector('form')?.getAttribute('aria-busy') === 'true');
            check(await page.locator('input[name="email"]').isDisabled(), `${mode}: controles bloqueados`);
            check(await page.locator('form').evaluate(form => form === window.authTestForm), `${mode}: formulario conservado durante envío`);
            release();
            await page.getByText('Acceso de prueba rechazado.', { exact: true }).waitFor();
            check(await page.locator('input[name="email"]').inputValue() === 'session@example.test', `${mode}: conserva correo`);
            check(await page.locator('input[name="password"]').inputValue() === 'Password123!', `${mode}: conserva contraseña`);
            if (mode === 'register') {
                check(await page.locator('input[name="name"]').inputValue() === 'Sesión de prueba', 'registro: conserva nombre');
                check(await page.locator('input[name="passwordConfirmation"]').inputValue() === 'Password123!', 'registro: conserva confirmación');
            }
            check(await page.locator('form').evaluate(form => form === window.authTestForm), `${mode}: formulario conservado tras fallo`);
            await page.getByRole('button', { name: 'Login', exact: true }).click();
            await page.waitForURL('**/drug');
            await page.getByText('Sesión de prueba', { exact: true }).first().waitFor();
            check(attempt === 2, `${mode}: una petición por intento`);
            passed.push(`${mode}: espera, fallo, valores conservados, reintento y sesión visible`);
        }
        check(errors.length === 0, JSON.stringify(errors));
        check(consoleErrors.length === 0, JSON.stringify(consoleErrors));
        return { passed, writes, pageErrors: errors.length, unexpectedConsole: consoleErrors.length, canvasWarnings, expectedNetworkErrors };
    } finally {
        release?.();
        await page.unroute('**/*', routeHandler);
        page.off('pageerror', onError);
        page.off('console', onConsole);
    }
}
