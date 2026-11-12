// P03: isolated HTTP simulation; never writes to the real API.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    const passed = [], errors = [], consoleErrors = [], writes = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    let mode = 'forbidden', refreshDenied = false, refreshes = 0, logouts = 0, reads = 0, creates = 0, deletes = 0;
    let items = [{ identificador: 7, descripcion: 'Original', logo: 'logo.png' }];
    view.on('pageerror', error => errors.push(error.message));
    view.on('console', message => {
        if (['error', 'warning'].includes(message.type()) && !message.text().startsWith('Failed to load resource:')) consoleErrors.push(message.text().slice(0, 200));
    });
    view.setDefaultTimeout(12000);
    await context.route('**/*', async route => {
        const req = route.request();
        if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: png });
        if (!['xhr', 'fetch'].includes(req.resourceType())) return route.fallback();
        const path = new URL(req.url()).pathname;
        if (path.endsWith('/refresh')) {
            refreshes++;
            if (refreshDenied) return route.fulfill({ status: 403, json: { error: 'User does not have the right permissions.', code: 403 } });
            return route.fulfill({ json: { user: { name: 'P03', email: 'p03@example.test' }, roles: [], permissions: ['drug.view', 'drug.create', 'drug.update', 'drug.delete'] } });
        }
        if (path.endsWith('/logout')) { logouts++; return route.fulfill({ json: {} }); }
        if (path.endsWith('/drug') && req.method() === 'GET') {
            reads++;
            if (mode === 'forbidden') return route.fulfill({ status: 403, json: { message: 'User does not have the right permissions.' } });
            if (mode === 'unauthenticated') return route.fulfill({ status: 401, json: { error: 'No autenticado', code: 401 } });
            if (mode === 'server') return route.fulfill({ status: 500, json: { message: 'Server error' } });
            if (mode === 'transport') return route.abort('failed');
            return route.fulfill({ json: { data: items, current_page: 1, per_page: 10, total: items.length, last_page: 1 } });
        }
        if (path.endsWith('/drug') && req.method() === 'POST') {
            creates++;
            writes.push(req.postData());
            if (creates === 1) return route.fulfill({ status: 403, json: { error: 'User does not have the right permissions.', code: 403 } });
            if (creates === 2) return route.fulfill({ status: 422, json: { error: { descripcion: ['Ya existe esa droga.'] } } });
            if (creates === 3) return route.abort('failed');
            if (creates === 4) return route.fulfill({ status: 500, json: { message: 'Internal error' } });
            const created = { identificador: 8, descripcion: 'Nueva P03', logo: 'logo.png' };
            items.push(created);
            return route.fulfill({ json: created });
        }
        if (path.endsWith('/drug/7') && req.method() === 'DELETE') {
            deletes++;
            if (deletes === 1) return route.fulfill({ status: 403, json: { error: 'User does not have the right permissions.', code: 403 } });
            items = items.filter(item => item.identificador !== 7);
            return route.fulfill({ json: {} });
        }
        throw new Error(`Unexpected HTTP ${req.method()} ${path}`);
    });
    try {
        await view.goto('http://localhost:5174/drug');
        const denial = view.getByRole('alert', { name: 'Acceso denegado' });
        await denial.waitFor();
        check(reads === 1 && refreshes === 1 && logouts === 0, '403 retried or changed session');
        await denial.getByRole('button', { name: 'Reintentar listado' }).focus();
        await view.keyboard.press('Tab');
        check(await denial.getByRole('button', { name: 'Cerrar sesión' }).evaluate(el => el === document.activeElement), 'Logout not reachable by keyboard');
        check(await denial.getByRole('link').count() === 0, 'Unsafe recovery link');
        passed.push('Body without code retains HTTP 403; accessible actions; no refresh/logout loop');
        for (const [nextMode, message] of [['unauthenticated', 'No autenticado.'], ['server', 'Error del servidor.'], ['transport', 'No se pudo conectar']]) {
            mode = nextMode;
            await view.getByRole('button', { name: 'Reintentar listado' }).click();
            await view.getByRole('alert').filter({ hasText: message }).waitFor();
            check(await denial.count() === 0, `${nextMode} incorrectly presented as 403`);
        }
        mode = 'success';
        await view.getByRole('button', { name: 'Reintentar listado' }).click();
        await view.getByRole('row').filter({ hasText: 'Original' }).waitFor();
        check(refreshes === 1 && logouts === 0, 'Error recovery changed session');
        passed.push('401, 500 and transport distinguished; explicit retry recovers list');

        await view.getByRole('button', { name: 'add', exact: true }).click();
        const dialog = view.getByRole('dialog', { name: 'Crear droga' });
        const form = dialog.locator('form');
        await form.getByLabel('Descripción', { exact: true }).fill('Nueva P03');
        await form.locator('input[type="file"]').setInputFiles({ name: 'p03.png', mimeType: 'image/png', buffer: png });
        const beforeWriteReads = reads;
        for (const message of ['Acceso denegado.', 'Ya existe esa droga.', 'No se pudo conectar', 'Error del servidor.']) {
            await form.getByRole('button', { name: 'Guardar droga' }).click();
            await dialog.getByRole('alert').filter({ hasText: message }).waitFor();
            check(await form.getByLabel('Descripción', { exact: true }).inputValue() === 'Nueva P03', 'Rejected create lost text');
            check(await form.locator('img[src^="blob:"]').count() === 1, 'Rejected create lost file');
            check(reads === beforeWriteReads, 'Rejected write invalidated/refetched list');
            if (creates === 2) {
                check(await form.getByLabel('Descripción', { exact: true }).getAttribute('aria-invalid') === 'true', '422 field error lost');
                // RHF intentionally blocks submit while the known field error is unchanged.
                await form.getByLabel('Descripción', { exact: true }).fill('Nueva P03 ');
                await form.getByLabel('Descripción', { exact: true }).fill('Nueva P03');
            }
        }
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await dialog.waitFor({ state: 'detached' });
        await view.getByRole('row').filter({ hasText: 'Nueva P03' }).waitFor();
        check(creates === 5 && writes.every(body => body.includes('filename="p03.png"')), 'Retry lost multipart file');
        passed.push('Create: 403/422/transport/500 preserve fields, file and modal; successful retry closes');

        await view.getByRole('row').filter({ hasText: 'Original' }).getByRole('menuitem', { name: 'Delete', exact: true }).click();
        const confirm = view.getByRole('dialog', { name: 'Borrar droga' });
        await confirm.getByRole('button', { name: 'Borrar', exact: true }).click();
        await confirm.getByRole('alert').filter({ hasText: 'Acceso denegado.' }).waitFor();
        check(await view.getByRole('row', { includeHidden: true }).filter({ hasText: 'Original' }).count() === 1, 'Denied delete changed rows');
        await confirm.getByRole('button', { name: 'Borrar', exact: true }).click();
        await confirm.waitFor({ state: 'detached' });
        check(await view.getByRole('row').filter({ hasText: 'Original' }).count() === 0, 'Delete recovery failed');
        check(refreshes === 1 && logouts === 0 && errors.length === 0 && consoleErrors.length === 0, 'Unexpected session effect or browser error');
        passed.push('Delete: 403 preserves selection/dialog; explicit retry recovers; no session side effects');
        refreshDenied = true;
        const beforeBootstrap = reads;
        await view.goto('http://localhost:5174/drug');
        await view.getByRole('main').getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        check(reads === beforeBootstrap && refreshes === 2 && logouts === 0, 'Bootstrap 403 logged out, looped or mounted protected queries');
        refreshDenied = false;
        await view.getByRole('button', { name: 'Reintentar', exact: true }).click();
        await view.getByRole('row').filter({ hasText: 'Nueva P03' }).waitFor();
        check(refreshes === 3 && logouts === 0 && errors.length === 0 && consoleErrors.length === 0, 'Bootstrap recovery failed');
        passed.push('Initial refresh 403 shows recovery without logout/loop/protected queries; explicit retry restores app');
        return { passed, creates, deletes, reads, refreshes, logouts, pageErrors: errors, consoleErrors };
    } finally {
        await context.close();
    }
}
