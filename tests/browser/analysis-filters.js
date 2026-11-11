async (page) => {
    const passed = [], errors = [], consoleErrors = [], requests = [];
    let legacySelectWarnings = 0;
    const check = (value, message) => { if (!value) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['error', 'warning'].includes(message.type())) return;
        if (message.text().startsWith('MUI: You have provided an out-of-range value `0`')) legacySelectWarnings++;
        else if (!message.text().startsWith('Canvas2D: Multiple readback operations')) consoleErrors.push(message.text());
    };
    const handler = async route => {
        const request = route.request(), url = new URL(request.url());
        if (request.resourceType() === 'image') return route.fulfill({ contentType: 'image/png',
            body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
        if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: {
            user: { name: 'Fixture', email: 'fixture@example.test' }, roles: [], permissions: [],
        } });
        if (url.pathname.endsWith('/logout')) return route.fulfill({ json: {} });
        if (url.pathname.endsWith('GraphIndex') || url.pathname.endsWith('/confiscation/map')) {
            requests.push({ path: url.pathname, params: Object.fromEntries(url.searchParams) });
            return route.fulfill({ json: { lineBarData: [], pieData: [], mapItems: [] } });
        }
        return route.fulfill({ json: { data: [{ identificador: 7, descripcion: 'Opción 7', logo: '' }],
            current_page: 1, per_page: 100, total: 1, last_page: 1 } });
    };
    const applied = () => page.evaluate(async () => {
        const url = performance.getEntriesByType('resource').find(entry =>
            new URL(entry.name).pathname === '/src/store/store.ts').name;
        return (await import(url)).store.getState().analysisFilters;
    });
    const dates = async () => {
        for (const index of [0, 1]) {
            const field = page.locator(`input[name="${index ? 'end_date' : 'start_date'}"]`).locator('..');
            for (const [name, value] of [['Day', index ? '09' : '02'], ['Month', index ? '11' : '01'], ['Year', '2026']]) {
                const section = field.getByRole('spinbutton', { name, exact: true });
                await section.click(); await section.pressSequentially(value);
            }
            await field.getByRole('spinbutton', { name: 'Year', exact: true }).press('Tab');
        }
    };
    const select = async name => {
        const field = { Drogas: 'drugs', Armas: 'weapons', Municiones: 'ammunitions' }[name];
        await page.locator(`#mui-component-select-${field}`).click();
        await page.getByRole('option', { name: 'Opción 7', exact: true }).click();
        await page.keyboard.press('Escape');
    };
    page.on('pageerror', onError); page.on('console', onConsole);
    page.setDefaultTimeout(10000);
    await page.route('**/*', handler);
    try {
        await page.goto('http://127.0.0.1:4175/graph');
        const apply = page.getByRole('button', { name: 'Aplicar filtros', exact: true });
        await page.getByRole('combobox', { name: 'Drogas', exact: true }).waitFor();
        await apply.click();
        check((await applied()).start_date === '' && requests.length === 0, 'Formulario inválido aplica filtros');
        await dates(); await select('Drogas');
        check((await applied()).drugs.length === 0 && requests.length === 0, 'Edición filtra antes de Aplicar');
        await page.getByRole('combobox', { name: 'Periodo', exact: true }).click();
        await page.getByRole('option', { name: 'Meses', exact: true }).click();
        const graphResponse = page.waitForResponse(r => r.url().includes('drugGraphIndex'));
        await apply.click(); await graphResponse;
        const graphFilters = await applied();
        check(JSON.stringify(graphFilters) === JSON.stringify({ start_date: '2026-01-02', end_date: '2026-11-09',
            drugs: ['7'], weapons: [], ammunitions: [] }), JSON.stringify(graphFilters));
        check(requests[0].params.period === 'month' && requests[0].params.drugs === '[7]' &&
            requests[0].params.start_date === graphFilters.start_date, 'Contrato gráfico alterado');
        passed.push('gráficos: inválido y borrador no aplican; envío válido publica solo filtros comunes y conserva contrato');
        await select('Drogas');
        check(JSON.stringify(await applied()) === JSON.stringify(graphFilters) && requests.length === 1, 'Borrador cambia filtros aplicados');
        await page.getByRole('button', { name: 'Map', exact: true }).click();
        await page.locator('.leaflet-container').waitFor();
        check(JSON.stringify(await applied()) === JSON.stringify(graphFilters), 'Navegación borra filtros');
        passed.push('edición posterior aislada y snapshot Redux conservado al navegar; consultas aún antiguas');
        await dates(); await select('Armas'); await select('Municiones');
        check(requests.length === 1 && JSON.stringify(await applied()) === JSON.stringify(graphFilters), 'Mapa aplica edición pendiente');
        const mapResponse = page.waitForResponse(r => r.url().includes('/confiscation/map'));
        await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click(); await mapResponse;
        const mapFilters = await applied();
        check(mapFilters.drugs.length === 0 && mapFilters.weapons[0] === '7' && mapFilters.ammunitions[0] === '7', 'Mapa no reemplaza selección');
        check(Object.keys(mapFilters).length === 5 && requests[1].params.weapons === '[7]' &&
            requests[1].params.ammunitions === '[7]' && requests[1].params.drugs === '[]', 'Contrato de mapa alterado');
        passed.push('mapa: Aplicar reemplaza filtros sin controles visuales y conserva parámetros HTTP');
        await page.locator('button').filter({ has: page.locator('[data-testid="LogoutIcon"]') }).click();
        await page.waitForURL('**/auth/login');
        check(JSON.stringify(await applied()) === JSON.stringify({ start_date: '', end_date: '', drugs: [], weapons: [], ammunitions: [] }), 'Logout conserva filtros');
        passed.push('salida restablece los filtros compartidos');
        check(errors.length === 0 && consoleErrors.length === 0, JSON.stringify({ errors, consoleErrors }));
        return { passed, requests, errors, consoleErrors, legacySelectWarnings };
    } finally {
        await page.unroute('**/*', handler);
        page.off('pageerror', onError); page.off('console', onConsole);
    }
}
