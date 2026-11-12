async (page) => {
    const passed = [], errors = [], consoleErrors = [], reads = [];
    let fail = 'drug';
    let expectedErrors = 0, legacySelectWarnings = 0;
    const check = (value, text) => { if (!value) throw new Error(text); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['error', 'warning'].includes(message.type())) return;
        if (message.text().startsWith('Failed to load resource:')) expectedErrors++;
        else if (message.text().startsWith('MUI: You have provided an out-of-range value `0`')) legacySelectWarnings++;
        else if (!message.text().startsWith('Canvas2D: Multiple readback operations')) consoleErrors.push(message.text());
    };
    const main = { identificador: 7, fecha: '2026-11-08', observacion: 'Original', direccion: 'Dirección', departamento: 'Departamento', municipalidad: 'Municipio', latitud: 1, longitud: 2 };
    const routeHandler = async route => {
        const req = route.request(), url = new URL(req.url());
        if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        if (!['fetch', 'xhr'].includes(req.resourceType())) return route.fallback();
        if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: { user: { name: 'Fixture', email: 'fixture@example.test' }, roles: [], permissions: ["graph","map","drug","weapon","ammunition","confiscation","drugConfiscation","weaponConfiscation","ammunitionConfiscation","drugPresentation"].flatMap(domain => (['dashboard', 'graph', 'map', 'activity'].includes(domain) ? ['view'] : ['view', 'create', 'update', 'delete']).map(action => domain + '.' + action)) } });
        const domain = url.pathname.split('/').at(-1);
        if (['drug', 'weapon', 'ammunition', 'drugPresentation'].includes(domain)) {
            const p = Number(url.searchParams.get('page')); reads.push({ domain, page: p });
            if (fail === domain) return route.fulfill({ status: 503, json: { error: 'Catálogo no disponible' } });
            const rows = [1, 2, 3].map(i => ({ identificador: i, descripcion: domain + ' ' + i, logo: '' }));
            return route.fulfill({ json: { data: rows.slice((p - 1) * 2, p * 2), current_page: p, per_page: 2, total: 3, last_page: 2 } });
        }
        if (url.pathname.endsWith('/confiscation/7')) return route.fulfill({ json: main });
        return route.fulfill({ json: { data: [], total: 0, current_page: 1, last_page: 1 } });
    };
    page.on('pageerror', onError); page.on('console', onConsole);
    page.setDefaultTimeout(10000);
    await page.route('**/*', routeHandler);
    const selectCount = async (form, name, count) => {
        await form.getByRole('combobox', { name, exact: true }).click();
        check(await page.getByRole('option').count() === count, name + ': catálogo incompleto');
        await page.keyboard.press('Escape');
    };
    try {
        await page.goto('http://127.0.0.1:4175/graph');
        const form = page.locator('form');
        await page.getByRole('button', { name: 'Reintentar catálogos' }).waitFor();
        check(await form.locator('button[type="submit"]').isDisabled(), 'Graph allows unavailable catalog');
        fail = ''; await page.getByRole('button', { name: 'Reintentar catálogos' }).click();
        await page.getByRole('button', { name: 'Reintentar catálogos' }).waitFor({ state: 'detached' });
        await selectCount(form, 'Drogas', 3);
        passed.push('gráficos recupera catálogo paginado y bloquea envío durante fallo');
        const before = reads.length;
        await page.getByRole('button', { name: 'Map', exact: true }).click();
        await page.locator('.leaflet-container').waitFor();
        for (const name of ['Drogas', 'Armas', 'Municiones']) await selectCount(page.locator('form'), name, 3);
        check(reads.length === before, 'Map duplicated fresh catalog requests');
        passed.push('mapa comparte catálogos completos vigentes sin duplicar peticiones');
        fail = 'drugPresentation';
        await page.goto('http://127.0.0.1:4175/confiscation/edit/7');
        const panel = page.locator('#panel1-header').locator('..').locator('..');
        await panel.getByRole('button').filter({ has: page.locator('[data-testid="AddCircleIcon"]') }).click();
        const subform = panel.locator('form');
        await subform.getByLabel('Cantidad', { exact: true }).fill('9');
        await panel.getByRole('button', { name: 'Reintentar catálogos' }).waitFor();
        check(await subform.getByRole('button', { name: 'Guardar', exact: true }).isDisabled(), 'Subform allows unavailable catalog');
        fail = ''; await panel.getByRole('button', { name: 'Reintentar catálogos' }).click();
        await panel.getByRole('button', { name: 'Reintentar catálogos' }).waitFor({ state: 'detached' });
        check(await subform.getByLabel('Cantidad', { exact: true }).inputValue() === '9', 'Subform lost draft');
        await selectCount(subform, 'Droga', 3); await selectCount(subform, 'Presentación', 3);
        passed.push('subdecomiso conserva edición ante fallo de presentaciones y obtiene todas las opciones');
        for (const [p, name] of [[2, 'Arma'], [3, 'Munición']]) {
            await page.locator('#panel' + p + '-header').click();
            const content = page.locator('#panel' + p + '-header').locator('..').locator('..');
            await content.getByRole('button').filter({ has: page.locator('[data-testid="AddCircleIcon"]') }).click();
            await selectCount(content.locator('form'), name, 3);
        }
        passed.push('armas y municiones decomisadas consumen opciones Query completas');
        check(errors.length === 0 && consoleErrors.length === 0, JSON.stringify({ errors, consoleErrors }));
        return { passed, errors, consoleErrors, expectedErrors, legacySelectWarnings, reads: reads.length };
    } finally {
        await page.unroute('**/*', routeHandler);
        page.off('pageerror', onError); page.off('console', onConsole);
    }
}
