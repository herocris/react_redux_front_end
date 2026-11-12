// P12 read-only walkthrough. Run on http://localhost:5174 after preparation.
// Login uses the intentional prefilled fields. No credentials in the report.
async (page) => {
    const base = 'http://localhost:5174';
    const report = { cases: [], pageErrors: [], apiFailures: [] };
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const onError = error => report.pageErrors.push(error.message);
    const onResponse = response => {
        if (response.url().startsWith('http://localhost/api/') && response.status() >= 400) {
            report.apiFailures.push({ path: new URL(response.url()).pathname, status: response.status() });
        }
    };
    page.on('pageerror', onError);
    page.on('response', onResponse);
    const go = async path => {
        await page.waitForTimeout(1500);
        await page.goto(base + path);
        await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).first().waitFor();
    };
    const dates = async () => {
        for (const [label, day] of [['Fecha inicial', '01'], ['Fecha final', '30']]) {
            const group = page.getByRole('group', { name: label, exact: true });
            for (const [name, value] of [['Dia', day], ['Mes', '11'], ['Año', '2026']]) {
                const input = group.getByRole('spinbutton', { name, exact: true });
                await input.click();
                await input.pressSequentially(value);
            }
            await group.getByRole('spinbutton', { name: 'Año', exact: true }).press('Tab');
        }
    };
    let anonymous;
    try {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await go('/dashboard');
        await page.getByRole('link', { name: 'Abrir decomisos', exact: true }).click();
        await page.getByRole('columnheader', { name: 'id', exact: true }).click();
        await page.locator('[role="columnheader"][data-field="id"][aria-sort="ascending"]').waitFor();
        await page.locator('[role="columnheader"][data-field="id"]').click();
        await page.getByText('DEMO_P12_V1 Escenario B.', { exact: false }).first().waitFor();
        await page.locator('[role="row"]').filter({ hasText: 'DEMO_P12_V1 Escenario B.' })
            .getByRole('link', { name: 'Ver detalle' }).click();
        await page.getByRole('heading', { name: 'Detalle de decomiso' }).waitFor();
        for (const [panel, text] of [
            ['Drugs', 'DEMO_P12_V1 Sustancia A ficticia'],
            ['Weapons', 'DEMO_P12_V1 Arma de utileria ficticia'],
            ['Ammunitions', 'DEMO_P12_V1 Municion inerte ficticia'],
        ]) {
            await page.getByRole('button', { name: panel, exact: true }).click();
            await page.getByText(text, { exact: true }).first().waitFor();
        }
        report.cases.push({ name: 'dashboard, list and three nested details', result: 'PASS' });
        for (const path of ['/drug', '/drugPresentation', '/weapon', '/ammunition', '/user', '/rol', '/permiso', '/actividad']) {
            await go(path);
            await page.getByRole('grid').waitFor();
            check(!await page.getByRole('heading', { name: 'Acceso denegado' }).count(), `Denied ${path}`);
        }
        report.cases.push({ name: 'eight catalog/administration routes, read only', result: 'PASS' });
        await go('/graph');
        await dates();
        await page.getByRole('combobox', { name: 'Drogas', exact: true }).click();
        await page.getByRole('option', { name: 'DEMO_P12_V1 Sustancia A ficticia', exact: true }).click();
        await page.keyboard.press('Escape');
        const graphResponse = page.waitForResponse(r => r.url().includes('/drugGraphIndex'));
        await page.getByRole('button', { name: 'Aplicar filtros' }).click();
        check((await graphResponse).status() === 200, 'Graph HTTP');
        await page.getByText('Ver datos del gráfico', { exact: true }).click();
        await page.getByRole('cell', { name: '5', exact: true }).waitFor();
        report.cases.push({ name: 'graph, November 2026, fictitious drug total 5', result: 'PASS' });
        // React Router navigation preserves the applied filters between screens.
        const mapResponse = page.waitForResponse(r => r.url().includes('/confiscation/map'));
        await page.getByRole('button', { name: 'Mapa', exact: true }).click();
        const map = await mapResponse;
        check(map.status() === 200, 'Map HTTP');
        const items = (await map.json()).mapItems;
        check(items.length === 2 && items.every(item => item.observacion.startsWith('DEMO_P12_V1')), 'Map isolation');
        report.cases.push({ name: 'map, shared filters, two fictitious points', result: 'PASS' });
        await go('/ruta-demo-p12-inexistente');
        await page.getByRole('heading', { name: /Página no encontrada/ }).waitFor();
        report.cases.push({ name: 'unknown route', result: 'PASS' });
        // Separate anonymous context exercises real refusals without changing accounts.
        anonymous = await page.context().browser().newContext();
        const guest = await anonymous.newPage();
        guest.on('pageerror', onError);
        await guest.goto(base + '/confiscation');
        await guest.getByRole('button', { name: 'Iniciar sesión', exact: true }).waitFor();
        check(new URL(guest.url()).pathname === '/auth/login', 'Guest route guard');
        const prefilled = await guest.locator('input').evaluateAll(inputs => inputs.filter(input => input.value.length > 0).length);
        check(prefilled === 2, 'Prefilled access');
        const unauthorized = await anonymous.request.get('http://localhost/api/confiscation', { headers: { Accept: 'application/json' } });
        check(unauthorized.status() === 401, 'Anonymous API refusal');
        await guest.getByLabel('Correo', { exact: true }).fill('p12-inexistente@example.test');
        await guest.getByLabel('Contraseña', { exact: true }).fill('Ficticia-P12-invalida');
        const rejected = guest.waitForResponse(r => r.url().endsWith('/login') && r.request().method() === 'POST');
        await guest.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
        const status = (await rejected).status();
        check(status === 401 || status === 422, 'Invalid login refusal');
        await guest.getByRole('alert').filter({ hasText: /.+/ }).waitFor();
        report.cases.push({ name: 'guest route, anonymous API 401, invalid login', result: 'PASS', invalidLoginStatus: status });
        await guest.reload();
        const login = guest.waitForResponse(r => r.url().endsWith('/login') && r.request().method() === 'POST');
        await guest.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
        check((await login).status() === 200, 'Prefilled login');
        await guest.waitForURL(base + '/dashboard');
        await guest.reload();
        await guest.getByRole('button', { name: 'Cerrar sesión', exact: true }).waitFor();
        const logout = guest.waitForResponse(r => r.url().endsWith('/logout'));
        await guest.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
        check((await logout).status() === 200, 'Logout');
        await guest.getByRole('button', { name: 'Iniciar sesión', exact: true }).waitFor();
        report.cases.push({ name: 'prefilled login 200, reload session, logout 200', result: 'PASS' });
    } catch (error) {
        report.failure = error.message;
    } finally {
        if (anonymous) await anonymous.close();
        page.off('pageerror', onError);
        page.off('response', onResponse);
    }
    return report;
}
