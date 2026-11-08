async (page) => {
    const baseURL = 'http://127.0.0.1:4175';
    const errors = [];
    const passed = [];
    const writes = [];
    const unexpectedConsole = [];
    let expectedNetworkErrors = 0;
    let items = [{ identificador: '7', nombre: 'Original' }];
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
        if (message.text().startsWith('Failed to load resource:') && message.location().url.includes('/permission')) {
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
        if (url.pathname.endsWith('/permission') && request.method() === 'GET') {
            return route.fulfill({ json: {
                data: items,
                current_page: 1, per_page: 10, total: items.length, last_page: 1, orderBy: 'id', order: 'asc',
            } });
        }
        if (request.method() !== 'GET') writes.push({ method: request.method(), path: url.pathname, body: request.postData() || '' });
        if (url.pathname.endsWith('/permission') && request.method() === 'POST') {
            createAttempts++;
            if (createAttempts === 1) {
                await createGate;
                return route.fulfill({ status: 422, json: { error: { nombre: ['Ya existe ese permiso.'], campoAjeno: ['Error general.'] } } });
            }
            items.push({ identificador: '8', nombre: 'Nueva' });
            return route.fulfill({ json: items.at(-1) });
        }
        if (url.pathname.endsWith('/permission/7') && request.method() === 'PUT') {
            editAttempts++;
            if (editAttempts === 1) return route.abort('failed');
            items[0] = { identificador: '7', nombre: 'Editada' };
            return route.fulfill({ json: items[0] });
        }
        if (url.pathname.endsWith('/permission/7') && request.method() === 'DELETE') {
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
        await page.goto(baseURL + '/permiso');
        await row().waitFor();
        await row().getByRole('menuitem', { name: 'Delete', exact: true }).click();
        await page.getByRole('dialog', { name: 'Borrar permiso' }).getByRole('button', { name: 'Cancelar' }).click();
        await page.getByRole('button', { name: 'add', exact: true }).click();
        await page.getByText('Crear permiso', { exact: true }).waitFor();
        check(await form.getByLabel('Nombre', { exact: true }).inputValue() === '', 'Cancel left an active entity in the create form');
        passed.push('Cancelar borrado limpia la selección antes de crear');
        await form.getByLabel('Nombre', { exact: true }).fill('Nueva');
        await form.getByRole('button', { name: 'Guardar permiso' }).click();
        await page.waitForFunction(() => document.querySelector('form fieldset')?.disabled === true);
        check(await form.getByRole('button', { name: 'Guardar permiso' }).isDisabled(), 'Submit is not disabled while pending');
        check(await form.getByLabel('Nombre', { exact: true }).isDisabled(), 'Description is not disabled while pending');
        await page.keyboard.press('Enter');
        check(createAttempts === 1, 'Pending form submitted twice');
        await page.keyboard.press('Escape');
        check(await form.count() === 1, 'Pending form closed on Escape');
        releaseCreate();
        await page.getByRole('alert').filter({ hasText: 'Ya existe ese permiso.' }).waitFor();
        check(await form.getByLabel('Nombre', { exact: true }).inputValue() === 'Nueva', 'Failed create lost description');
        check(await form.getByLabel('Nombre', { exact: true }).getAttribute('aria-invalid') === 'true', 'Server error not mapped to field');
        await page.getByRole('dialog', { name: 'Crear permiso' }).screenshot({ path: '.playwright-mcp/permission-form.png' });
        passed.push('Crear: 422 conserva nombre y muestra error de campo; envío bloqueado');
        await form.getByRole('button', { name: 'Guardar permiso' }).click();
        await form.waitFor({ state: 'detached' });
        await page.getByRole('row').filter({ hasText: 'Nueva' }).waitFor();
        check(createAttempts === 2, 'Unexpected create requests');
        passed.push('Crear: reintento cierra solo tras éxito y añade la fila');
        await row().getByRole('menuitem', { name: 'Edit', exact: true }).click();
        await form.getByLabel('Nombre', { exact: true }).fill('Editada');
        await form.getByRole('button', { name: 'Guardar permiso' }).click();
        await page.getByRole('alert').filter({ hasText: 'No se pudo conectar' }).waitFor();
        check(await form.getByLabel('Nombre', { exact: true }).inputValue() === 'Editada', 'Failed update lost fields');
        passed.push('Editar: fallo de red conserva formulario y permite reintento');
        await form.getByRole('button', { name: 'Guardar permiso' }).click();
        await form.waitFor({ state: 'detached' });
        const editedRow = page.getByRole('row', { includeHidden: true }).filter({ hasText: 'Editada' });
        await editedRow.waitFor();
        check(editAttempts === 2, 'Unexpected update requests');
        const update = writes.filter(write => write.path.endsWith('/7') && write.method === 'PUT');
        check(update.every(write => { const body = JSON.parse(write.body); return body.id === '7' && body.nombre === 'Editada'; }), 'Update JSON contract changed');
        passed.push('Editar: éxito actualiza fila y conserva PUT JSON');
        await editedRow.getByRole('menuitem', { name: 'Delete', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Borrar permiso' });
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
