async (page) => {
    const check = (value, message) => { if (!value) throw new Error(message); };
    const passed = [], errors = [], consoleErrors = [], reads = [];
    let expectedNetworkErrors = 0;
    let items = Array.from({ length: 11 }, (_, i) => ({ identificador: i + 1, nombre: 'Keep ' + String(i + 1).padStart(2, '0') }));
    let failList = false, failOptions = false;
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['error', 'warning'].includes(message.type())) return;
        if (message.text().startsWith('Failed to load resource:') && message.location().url.includes('/permission')) expectedNetworkErrors++;
        else if (!message.text().startsWith('Canvas2D: Multiple readback operations')) consoleErrors.push(message.text().slice(0, 200));
    };
    const routeHandler = async route => {
        const req = route.request();
        if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        if (!['fetch', 'xhr'].includes(req.resourceType())) return route.fallback();
        const url = new URL(req.url()), method = req.method();
        if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: { user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: [] } });
        if (url.pathname.endsWith('/permission') && method === 'GET') {
            const options = url.searchParams.get('per_page') === '100';
            reads.push({ page: url.searchParams.get('page'), size: url.searchParams.get('per_page'),
                sort: url.searchParams.get('sort_by'), order: url.searchParams.get('type'), filter: url.searchParams.get('nombre') });
            if ((options && failOptions) || (!options && failList)) return route.fulfill({ status: 503, json: { error: 'Permisos temporalmente no disponibles.' } });
            let rows = items.filter(row => row.nombre.includes(url.searchParams.get('nombre') || ''));
            rows = [...rows].sort((a, b) => a.nombre.localeCompare(b.nombre));
            if (url.searchParams.get('type') === 'desc') rows.reverse();
            const size = options ? 2 : Number(url.searchParams.get('per_page'));
            const p = Number(url.searchParams.get('page'));
            return route.fulfill({ json: { data: rows.slice((p - 1) * size, p * size), current_page: p,
                per_page: size, total: rows.length, last_page: Math.max(1, Math.ceil(rows.length / size)) } });
        }
        if (url.pathname.endsWith('/permission') && method === 'POST') {
            const row = { identificador: 12, nombre: req.postDataJSON().nombre };
            items.push(row); return route.fulfill({ json: row });
        }
        if (/\/permission\/[^/]+$/.test(url.pathname) && method === 'DELETE') {
            items = items.filter(row => row.identificador !== Number(url.pathname.split('/').at(-1)));
            return route.fulfill({ json: {} });
        }
        if (/\/permission\/[^/]+$/.test(url.pathname) && method === 'PUT') {
            const row = { identificador: Number(url.pathname.split('/').at(-1)), nombre: req.postDataJSON().nombre };
            items = items.map(item => item.identificador === row.identificador ? row : item);
            return route.fulfill({ json: row });
        }
        return route.fulfill({ json: { data: [], current_page: 1, per_page: 10, total: 0, last_page: 1 } });
    };
    const loadedModule = async path => page.evaluate(async path => {
        const url = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === '/src/queries/queryClient.ts').name;
        const { queryClient } = await import(url);
        if (path === 'invalidate') await queryClient.invalidateQueries({ queryKey: ['permission'] });
        else return queryClient.getQueryData(['permission', 'options'])?.length;
    }, path);
    page.on('pageerror', onError); page.on('console', onConsole);
    page.setDefaultTimeout(10000);
    await page.route('**/*', routeHandler);
    try {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto('http://127.0.0.1:4175/permiso');
        await page.getByText('1–10 of 11', { exact: true }).waitFor();
        // Apply a real column filter through the DataGrid menu.
        const header = page.locator('[data-field="nombre"][role="columnheader"]');
        await header.hover();
        await header.getByRole('button', { name: 'Menu', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Filter', exact: true }).click();
        await page.getByRole('textbox', { name: 'Value', exact: true }).fill('Keep');
        await page.waitForResponse(r => new URL(r.url()).searchParams.get('nombre') === 'Keep');
        await page.keyboard.press('Escape');
        await header.click(); await header.click();
        await page.waitForFunction(() => document.querySelector('[data-field="nombre"][role="columnheader"]')?.getAttribute('aria-sort') === 'descending');
        await page.getByRole('button', { name: 'Go to next page' }).click();
        await page.getByText('11–11 of 11', { exact: true }).waitFor();
        const last = page.getByRole('row').filter({ hasText: 'Keep 01' });
        await last.getByRole('menuitem', { name: 'Delete', exact: true }).click();
        await page.getByRole('dialog', { name: 'Borrar permiso' }).getByRole('button', { name: 'Borrar', exact: true }).click();
        await page.getByRole('dialog', { name: 'Borrar permiso' }).waitFor({ state: 'detached' });
        await page.getByText('1–10 of 10', { exact: true }).waitFor();
        const latest = reads.at(-1);
        check(latest.page === '1' && latest.order === 'desc' && latest.filter === 'Keep', 'Empty page recovery lost filters/sort');
        passed.push('borrado de última fila vuelve a página válida con total, filtro y orden conservados');
        failList = true;
        await loadedModule('invalidate');
        await page.getByRole('button', { name: 'Reintentar listado' }).waitFor();
        failList = false;
        await page.getByRole('button', { name: 'Reintentar listado' }).click();
        await page.getByRole('button', { name: 'Reintentar listado' }).waitFor({ state: 'detached' });
        passed.push('fallo de recarga conserva datos y reintento del listado se recupera');
        await page.getByRole('button', { name: 'Roles', exact: true }).click();
        await page.getByText('No rows', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'add', exact: true }).click();
        await page.getByRole('combobox', { name: 'Permisos', exact: true }).click();
        check(await page.getByRole('option').count() === 10, 'Permission options did not collect all pages');
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
        check(await loadedModule('count') === 10, 'Complete catalog missing');
        passed.push('roles obtiene catálogo completo con límite del servidor de dos filas por página');
        await page.getByRole('button', { name: 'Permission', exact: true }).click();
        await page.getByRole('button', { name: 'add', exact: true }).click();
        await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Keep New');
        await page.getByRole('button', { name: 'Guardar permiso' }).click();
        await page.locator('form').waitFor({ state: 'detached' });
        await page.getByRole('button', { name: 'Roles', exact: true }).click();
        await page.getByText('No rows', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'add', exact: true }).click();
        await page.getByRole('combobox', { name: 'Permisos', exact: true }).click();
        await page.getByRole('option', { name: 'Keep New', exact: true }).waitFor();
        check(await page.getByRole('option').count() === 11, 'Create did not invalidate cached options');
        await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
        passed.push('crear invalida opciones cacheadas y roles muestra el permiso nuevo al volver');
        const userLoaded = page.waitForResponse(r => new URL(r.url()).pathname.endsWith('/user') && r.request().method() === 'GET');
        await page.getByRole('button', { name: 'Users', exact: true }).click();
        await userLoaded;
        await page.getByText('No rows', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'add', exact: true }).click();
        await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill('Borrador preservado');
        failOptions = true;
        await loadedModule('invalidate');
        await page.getByRole('button', { name: 'Reintentar permisos' }).waitFor();
        check(await page.getByRole('button', { name: 'Guardar usuario' }).isDisabled(), 'Form allows write with failed options');
        check(await page.getByRole('textbox', { name: 'Nombre', exact: true }).inputValue() === 'Borrador preservado', 'Options failure reset form');
        failOptions = false;
        await page.getByRole('button', { name: 'Reintentar permisos' }).click();
        await page.getByRole('button', { name: 'Reintentar permisos' }).waitFor({ state: 'detached' });
        await page.getByRole('combobox', { name: 'Permisos', exact: true }).click();
        await page.getByRole('option', { name: 'Keep New', exact: true }).waitFor();
        await page.keyboard.press('Escape');
        check(await page.getByRole('textbox', { name: 'Nombre', exact: true }).inputValue() === 'Borrador preservado', 'Options retry reset form');
        passed.push('usuarios comparte opciones actualizadas; fallo/reintento conserva borrador y bloquea envío incompleto');
        await page.keyboard.press('Escape');
        check(errors.length === 0 && consoleErrors.length === 0, JSON.stringify({ errors, consoleErrors }));
        return { passed, pageErrors: errors, unexpectedConsole: consoleErrors, expectedNetworkErrors,
            reads: reads.length, optionPages: reads.filter(r => r.size === '100').length };
    } finally {
        await page.unroute('**/*', routeHandler);
        page.off('pageerror', onError); page.off('console', onConsole);
    }
}
