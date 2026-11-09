async (page) => {
    const baseURL = 'http://127.0.0.1:4175';
    const errors = [];
    const passed = [];
    const writes = [];
    let items = [{ identificador: '7', descripcion: 'Original', logo: 'logo.png' }];
    const unexpectedConsole = [];
    let expectedNetworkErrors = 0;
    let createAttempts = 0;
    let editAttempts = 0;
    let deleteAttempts = 0;
    let releaseCreate;
    const createGate = new Promise(resolve => { releaseCreate = resolve; });
    let releaseDelete;
    const deleteGate = new Promise(resolve => { releaseDelete = resolve; });
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['warning', 'error'].includes(message.type())) return;
        if (message.text().startsWith('Failed to load resource:') && message.location().url.includes('/drug')) {
            expectedNetworkErrors++;
        } else unexpectedConsole.push(message.text().slice(0, 250));
    };
    try {
    page.on('pageerror', onError);
    page.on('console', onConsole);
    page.setDefaultTimeout(10000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.route('**/*', async route => {
        const request = route.request();
        if (request.resourceType() === 'image') {
            return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        }
        if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
        const url = new URL(request.url());
        if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: {
            user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: [],
        } });
        if (url.pathname.endsWith('/drug') && request.method() === 'GET') {
            return route.fulfill({ json: {
                data: items,
                current_page: 1, per_page: 10, total: items.length, last_page: 1, orderBy: 'id', order: 'asc',
            } });
        }
        if (request.method() !== 'GET') writes.push({ method: request.method(), path: url.pathname, body: request.postData() || '' });
        if (url.pathname.endsWith('/drug') && request.method() === 'POST') {
            createAttempts++;
            if (createAttempts === 1) {
                await createGate;
                return route.fulfill({ status: 422, json: { error: { descripcion: ['Ya existe esa droga.'] } } });
            }
            const created = { identificador: '8', descripcion: 'Nueva', logo: 'nueva.png' };
            items.push(created);
            return route.fulfill({ json: created });
        }
        if (url.pathname.endsWith('/drug/7') && request.method() === 'POST') {
            editAttempts++;
            if (editAttempts === 1) return route.abort('failed');
            const updated = { identificador: '7', descripcion: 'Editada', logo: 'logo.png' };
            items = items.map(item => item.identificador === updated.identificador ? updated : item);
            return route.fulfill({ json: updated });
        }
        if (url.pathname.endsWith('/drug/7') && request.method() === 'DELETE') {
            deleteAttempts++;
            if (deleteAttempts === 1) {
                await deleteGate;
                return route.fulfill({ status: 500, json: { error: 'No se pudo borrar.' } });
            }
            items = items.filter(item => item.identificador !== '7');
            return route.fulfill({ json: {} });
        }
        return route.fulfill({ json: { data: [] } });
    });
    const form = page.locator('form');
    const row = () => page.getByRole('row').filter({ hasText: 'Original' });
        await page.goto(baseURL + '/drug');
        await row().waitFor();
        await row().getByRole('menuitem', { name: 'Delete', exact: true }).click();
        await page.getByRole('dialog', { name: 'Borrar droga' }).getByRole('button', { name: 'Cancelar' }).click();
        await page.getByRole('button', { name: 'add', exact: true }).click();
        await page.getByText('Crear droga', { exact: true }).waitFor();
        check(await form.getByLabel('Descripción', { exact: true }).inputValue() === '', 'Cancel left an active entity in the create form');
        passed.push('Cancelar borrado limpia la selección antes de crear');
        await form.getByLabel('Descripción', { exact: true }).fill('Nueva');
        await form.locator('input[type="file"]').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await page.waitForFunction(() => document.querySelector('form fieldset')?.disabled === true);
        check(await form.getByRole('button', { name: 'Guardar droga' }).isDisabled(), 'Submit is not disabled while pending');
        check(await form.getByRole('button', { name: 'Eliminar imagen 1' }).isDisabled(), 'File removal is not disabled while pending');
        check(await form.getByLabel('Descripción', { exact: true }).isDisabled(), 'Description is not disabled while pending');
        await page.keyboard.press('Escape');
        check(await form.count() === 1, 'Pending form closed on Escape');
        releaseCreate();
        await page.getByRole('alert').filter({ hasText: 'Ya existe esa droga.' }).waitFor();
        check(await form.getByLabel('Descripción', { exact: true }).inputValue() === 'Nueva', 'Failed create lost description');
        check(await form.locator('img[src^="blob:"]').count() === 1, 'Failed create lost image preview');
        check(await form.getByLabel('Descripción', { exact: true }).getAttribute('aria-invalid') === 'true', 'Server error not mapped to field');
        await page.getByRole('dialog', { name: 'Crear droga' }).screenshot({ path: '.playwright-mcp/drug-form.png' });
        passed.push('Crear: 422 conserva texto e imagen y muestra error de campo; envío bloqueado');
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await form.waitFor({ state: 'detached' });
        await page.getByRole('row').filter({ hasText: 'Nueva' }).waitFor();
        check(createAttempts === 2, 'Unexpected create requests');
        check(writes.filter(write => write.path.endsWith('/drug')).every(write => write.body.includes('filename="logo.png"')), 'Retry lost the selected file');
        passed.push('Crear: reintento cierra solo tras éxito y añade la fila');
        await row().getByRole('menuitem', { name: 'Edit', exact: true }).click();
        await form.getByLabel('Descripción', { exact: true }).fill('Editada');
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await page.getByRole('alert').filter({ hasText: 'No se pudo conectar' }).waitFor();
        check(await form.getByLabel('Descripción', { exact: true }).inputValue() === 'Editada', 'Failed update lost fields');
        passed.push('Editar: fallo de red conserva formulario y permite reintento');
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await form.waitFor({ state: 'detached' });
        const editedRow = page.getByRole('row', { includeHidden: true }).filter({ hasText: 'Editada' });
        await editedRow.waitFor();
        check(editAttempts === 2, 'Unexpected update requests');
        const update = writes.filter(write => write.path.endsWith('/7') && write.method === 'POST');
        check(update.every(write => write.body.includes('name="_method"') && write.body.includes('PUT') && !write.body.includes('name="logo"')), 'Update contract changed');
        passed.push('Editar: éxito actualiza fila y conserva POST multipart con _method=PUT');
        await editedRow.getByRole('menuitem', { name: 'Delete', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Borrar droga' });
        await dialog.getByRole('button', { name: 'Borrar', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('[role="dialog"] button')?.disabled === true);
        check(await dialog.getByRole('button', { name: 'Cancelar' }).isDisabled(), 'Pending delete can be cancelled');
        check(await dialog.getByRole('button', { name: 'Borrar', exact: true }).isDisabled(), 'Pending delete can be submitted again');
        await page.keyboard.press('Escape');
        check(await dialog.count() === 1, 'Pending delete closed on Escape');
        releaseDelete();
        await dialog.getByRole('alert').filter({ hasText: 'No se pudo borrar.' }).waitFor();
        check(await editedRow.count() === 1, 'Delete failure removed row');
        passed.push('Borrar: fallo conserva diálogo y fila');
        await dialog.getByRole('button', { name: 'Borrar', exact: true }).click();
        await dialog.waitFor({ state: 'detached' });
        await editedRow.waitFor({ state: 'detached' });
        check(deleteAttempts === 2, 'Unexpected delete requests');
        check(errors.length === 0, errors.join('; '));
        check(unexpectedConsole.length === 0, unexpectedConsole.join('; '));
        passed.push('Borrar: reintento elimina fila y cierra diálogo sin rechazos sin manejar');
        return { passed, pageErrors: errors, unexpectedConsole, expectedNetworkErrors, requests: { create: createAttempts, update: editAttempts, delete: deleteAttempts } };
    } finally {
        releaseCreate();
        releaseDelete();
        page.off('pageerror', onError);
        page.off('console', onConsole);
        await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
}
