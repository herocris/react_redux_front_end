async (page) => {
    const passed = [], errors = [], consoleErrors = [], requests = [];
    let legacySelectWarnings = 0, mapFailure = true;
    const check = (value, message) => { if (!value) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['error', 'warning'].includes(message.type())) return;
        if (message.text().startsWith('MUI: You have provided an out-of-range value `0`')) legacySelectWarnings++;
        else if (!message.text().includes('503 (Service Unavailable)') && !message.text().startsWith('Canvas2D: Multiple readback operations')) consoleErrors.push(message.text());
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
            if (url.pathname.endsWith('/confiscation/map') && mapFailure) {
                mapFailure = false;
                return route.fulfill({ status: 503, json: { error: 'Análisis no disponible' } });
            }
            return route.fulfill({ json: { lineBarData: [], pieData: [], mapItems: [{
                id: 1, latitud: 14.26, longitud: -86.56, observacion: '',
                drug_confiscations: [], weapon_confiscations: [], ammunition_confiscations: [],
            }] } });
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
        await page.locator('#mui-component-select-drugs').waitFor();
        await apply.click();
        check((await applied()).start_date === '' && requests.length === 0, 'Defaults consultan');
        await dates(); await select('Drogas');
        check(requests.length === 0, 'Borrador consulta');
        const graphResponse = page.waitForResponse(r => r.url().includes('drugGraphIndex'));
        await apply.click(); await graphResponse;
        await page.getByText('No hay resultados para los filtros aplicados.', { exact: true }).waitFor();
        const shared = await applied();
        check(requests[0].params.period === 'month' && requests[0].params.drugs === '[7]', 'Contrato gráfico');
        passed.push('defaults y borradores no consultan; Aplicar usa contrato y muestra vacío');
        await select('Drogas');
        await page.locator('#mui-component-select-period').click();
        await page.getByRole('option', { name: 'Años', exact: true }).click();
        await page.getByRole('button', { name: 'Linea', exact: true }).click();
        check(requests.length === 1 && JSON.stringify(await applied()) === JSON.stringify(shared), 'Control visual o borrador consulta');
        await page.evaluate(async () => {
            const resource = performance.getEntriesByType('resource').find(e => new URL(e.name).pathname === '/src/queries/queryClient.ts').name;
            const { queryClient } = await import(resource);
            await queryClient.invalidateQueries({ queryKey: ['graph', 'analysis'] });
        });
        check(await page.locator('#mui-component-select-period').textContent() === 'Años', 'Recarga sobrescribe borrador');
        check(requests.at(-1).params.period === 'month' && requests.at(-1).params.typeGraph === 'bar', 'Recarga usa controles pendientes');
        passed.push('tipo visual sin GET; recarga usa argumentos aplicados y conserva borrador RHF');
        await select('Drogas');
        const changedGraph = page.waitForResponse(r => r.url().includes('drugGraphIndex'));
        await apply.click(); await changedGraph;
        check(requests.at(-1).params.period === 'year' && requests.at(-1).params.typeGraph === 'line', 'Aplicar no actualiza argumentos exclusivos');
        check(JSON.stringify(await applied()) === JSON.stringify(shared), 'Controles exclusivos cambian filtros comunes');
        passed.push('Aplicar cambia período y typeGraph enviados sin añadirlos al contexto compartido');
        await page.getByRole('button', { name: 'Map', exact: true }).click();
        await page.getByText('Análisis no disponible', { exact: true }).waitFor();
        check(JSON.stringify(await applied()) === JSON.stringify(shared), 'Navegación pierde contexto');
        check((await page.locator('#mui-component-select-drugs').textContent()).includes('Opción 7'), 'RHF no restaura selección aplicada');
        check(await page.locator('input[name="start_date"]').inputValue() === '02/01/2026', 'RHF no restaura fecha');
        await select('Armas');
        await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
        await page.locator('.leaflet-marker-icon').waitFor();
        check((await page.locator('#mui-component-select-weapons').textContent()).includes('Opción 7'), 'Reintento sobrescribe borrador');
        const mapReads = requests.filter(r => r.path.endsWith('/confiscation/map'));
        check(mapReads.length === 2 && mapReads.every(r => r.params.weapons === '[]' && r.params.drugs === '[7]'), 'Recuperación usa borrador o contrato incorrecto');
        passed.push('navegación restaura fechas/IDs; error y reintento conservan edición y consultan snapshot');
        const count = requests.length;
        for (let i = 0; i < 3; i++) {
            await page.getByRole('button', { name: 'Calor', exact: true }).click();
            await page.locator('.leaflet-heatmap-layer').waitFor();
            check(await page.locator('.leaflet-heatmap-layer').count() === 1, 'Capas acumuladas');
            await page.getByRole('button', { name: 'Ubicación', exact: true }).click();
            await page.locator('.leaflet-marker-icon').waitFor();
            check(await page.locator('.leaflet-heatmap-layer').count() === 0, 'Capa no retirada');
        }
        check(requests.length === count, 'Tipo mapa consulta');
        const response = page.waitForResponse(r => r.url().includes('/confiscation/map'));
        await page.getByRole('button', { name: 'Aplicar filtros', exact: true }).click(); await response;
        check(requests.at(-1).params.weapons === '[7]', 'Aplicar mapa pierde armas');
        await page.getByRole('button', { name: 'Graphs', exact: true }).click();
        await page.locator('#mui-component-select-drugs').waitFor();
        check((await applied()).weapons[0] === '7', 'Vuelta pierde contexto compartido');
        await page.getByRole('button', { name: 'Map', exact: true }).click();
        await page.locator('.leaflet-marker-icon').waitFor();
        passed.push('capas alternan sin acumulación ni GET; Aplicar mapa y navegación conservan contexto; remontaje sin excepciones');
        await page.locator('button').filter({ has: page.locator('[data-testid="LogoutIcon"]') }).click();
        await page.waitForURL('**/auth/login');
        check((await applied()).start_date === '', 'Logout conserva contexto');
        check(errors.length === 0 && consoleErrors.length === 0, JSON.stringify({ errors, consoleErrors }));
        return { passed, requests, errors, consoleErrors, legacySelectWarnings };
    } finally {
        await page.unroute('**/*', handler);
        page.off('pageerror', onError); page.off('console', onConsole);
    }
}
