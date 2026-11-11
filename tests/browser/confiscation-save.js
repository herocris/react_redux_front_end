async (page) => {
    const baseURL = 'http://127.0.0.1:4175';
    const passed = [], errors = [], writes = [], consoleMessages = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (['warning', 'error'].includes(message.type()) && !message.text().startsWith('Failed to load resource:')) consoleMessages.push(message.text().slice(0, 250));
    };
    const main = { identificador: 7, fecha: '2026-11-08', observacion: 'Original', direccion: 'Dirección', departamento: 'Departamento', municipalidad: 'Municipio', latitud: 1, longitud: 2 };
    const sub = { identificador: 8, cantidad: 3, peso: 1.5, foto: 'existente.png', decomiso: { identificador: 7 }, droga: { identificador: 1, descripcion: 'Droga original' }, presentacion: { identificador: 2, descripcion: 'Presentación original' }, arma: { identificador: 3, descripcion: 'Arma original' }, municion: { identificador: 4, descripcion: 'Munición original' } };
    let release;
    let mode = 'fail';
    let detailFails = true;
    let detailRequests = 0;
    page.setDefaultTimeout(10000);
    page.on('pageerror', onError);
    page.on('console', onConsole);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (request.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        if (!['fetch', 'xhr'].includes(request.resourceType()) || /\.(tsx?|m?js)$/.test(url.pathname)) return route.fallback();
        if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: { user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: [] } });
        if (request.method() !== 'GET') {
            writes.push({ path: url.pathname, method: request.method(), body: request.postData() || '' });
            const result = mode;
            if (result === 'fail') await new Promise(resolve => { release = resolve; });
            if (result === 'fail') return route.fulfill({ status: 422, json: { error: { cantidad: ['Guardado rechazado de prueba'] } } });
            const isMain = /\/confiscation(?:\/7)?$/.test(url.pathname);
            return route.fulfill({ json: isMain ? { ...main, observacion: 'Edición conservada' } : sub });
        }
        if (url.pathname.endsWith('/confiscation/7')) {
            detailRequests++;
            if (detailFails) return route.fulfill({ status: 500, json: { error: 'Detalle no disponible' } });
            return route.fulfill({ json: main });
        }
        if (/Confiscation\/7\/confiscation$/.test(url.pathname)) return route.fulfill({ json: { data: [sub], total: 1, current_page: 1, per_page: 10, last_page: 1 } });
        const options = { drug: [1, 'Droga original'], drugPresentation: [2, 'Presentación original'], weapon: [3, 'Arma original'], ammunition: [4, 'Munición original'] };
        const option = options[url.pathname.split('/').pop()];
        return route.fulfill({ json: { data: option ? [{ identificador: option[0], descripcion: option[1] }] : [], total: option ? 1 : 0, current_page: 1, last_page: 1, per_page: 10 } });
    });
    const save = async (form, name, verify) => {
        mode = 'fail';
        const before = writes.length;
        await form.evaluate(el => { window.savedForm = el; });
        await form.getByRole('button', { name, exact: true, includeHidden: true }).click();
        await page.waitForFunction(() => document.querySelector('fieldset[disabled]'));
        check(await form.evaluate(el => el === window.savedForm), 'Formulario desmontado durante el envío');
        check(await form.locator('fieldset').first().evaluate(el => el.disabled), 'Controles activos');
        check(await form.getByRole('button', { name, exact: true, includeHidden: true }).isDisabled(), 'Guardar activo');
        await form.evaluate(el => { el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
        await page.waitForFunction(() => !!document.querySelector('fieldset[disabled]'));
        check(writes.length === before + 1, 'Envío duplicado');
        release();
        await page.getByRole('alert').filter({ hasText: 'Guardado rechazado de prueba' }).waitFor();
        await form.locator('fieldset[disabled]').waitFor({ state: 'detached' });
        check(await form.evaluate(el => el === window.savedForm), 'Formulario desmontado tras el fallo');
        await verify();
        mode = 'success';
        await form.getByRole('button', { name, exact: true, includeHidden: true }).click();
        return before;
    };
    try {
        await page.goto(baseURL + '/confiscation/edit/7');
        await page.getByRole('alert').filter({ hasText: 'Detalle no disponible' }).waitFor();
        check(await page.locator('form').count() === 0, 'Edición montada antes de cargar detalle');
        detailFails = false;
        await page.getByRole('button', { name: 'Reintentar' }).click();
        await page.getByLabel('Observacion', { exact: true }).fill('Edición conservada');
        passed.push('Carga inicial fallida: error y reintento antes de montar la edición');
        const mainForm = page.locator('form').filter({ has: page.getByRole('button', { name: 'Guardar decomiso', includeHidden: true }) });
        const detailsBeforeSave = detailRequests;
        await save(mainForm, 'Guardar decomiso', async () => {
            check(await mainForm.getByLabel('Observacion', { exact: true }).inputValue() === 'Edición conservada', 'Edición perdida');
        });
        await mainForm.locator('fieldset[disabled]').waitFor({ state: 'detached' });
        check(detailRequests === detailsBeforeSave + 1, 'El guardado no invalidó detalle');
        check(await mainForm.getByLabel('Observacion', { exact: true }).inputValue() === 'Edición conservada', 'Recarga sobrescribió edición');
        passed.push('Edición principal: mismo formulario, bloqueo, 422, valores conservados y reintento y recarga sin sobrescribir edición');
        for (const [panel, domain, title] of [[1, 'drugConfiscation', 'Droga original'], [2, 'weaponConfiscation', 'Arma original'], [3, 'ammunitionConfiscation', 'Munición original']]) {
            await page.locator(`#panel${panel}-header`).click();
            const content = page.locator(`#panel${panel}-header`).locator('..').locator('..');
            await content.getByRole('button').filter({ hasText: title }).click();
            const form = content.locator('form');
            await form.getByLabel('Cantidad', { exact: true }).fill('9');
            await form.locator('input[type="file"]').setInputFiles({ name: 'retenida.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
            const before = await save(form, 'Guardar', async () => {
                check(await form.getByLabel('Cantidad', { exact: true }).inputValue() === '9', 'Cantidad perdida');
                check(await form.locator('img[src^="blob:"]').count() === 1, 'Archivo perdido');
                check(await content.getByRole('button', { name: 'Cancelar', exact: true }).isEnabled(), 'Cancelar no se recuperó');
            });
            await form.waitFor({ state: 'detached' });
            const attempts = writes.slice(before);
            check(attempts.length === 2 && attempts.every(w => w.path.endsWith(`/${domain}/8`) && w.body.includes('retenida.png') && w.body.includes('PUT')), 'Contrato/reintento de edición alterado');
            passed.push(`${domain}: edición con archivo, mismo formulario tras 422 y cierre solo tras éxito; multipart y padre conservados`);
        }
        await page.locator('#panel1-header').click();
        const drugPanel = page.locator('#panel1-header').locator('..').locator('..');
        await drugPanel.getByRole('button').filter({ has: page.locator('[data-testid="AddCircleIcon"]') }).click();
        const createForm = drugPanel.locator('form');
        await createForm.getByRole('combobox', { name: 'Droga', exact: true }).click();
        await page.getByRole('option', { name: 'Droga original', exact: true }).click();
        await createForm.getByRole('combobox', { name: 'Presentación', exact: true }).click();
        await page.getByRole('option', { name: 'Presentación original', exact: true }).click();
        await createForm.getByLabel('Cantidad', { exact: true }).fill('4');
        await createForm.getByLabel('Peso', { exact: true }).fill('2.5');
        await createForm.locator('input[type="file"]').setInputFiles({ name: 'nueva.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        const createBefore = await save(createForm, 'Guardar', async () => {
            check(await createForm.getByLabel('Cantidad', { exact: true }).inputValue() === '4', 'Alta perdió cantidad');
            check(await createForm.getByLabel('Peso', { exact: true }).inputValue() === '2.5', 'Alta perdió peso');
            check(await createForm.locator('[role="combobox"]').first().innerText() === 'Droga original', 'Alta perdió relación');
        });
        await createForm.waitFor({ state: 'detached' });
        check(writes.slice(createBefore).length === 2 && writes.slice(createBefore).every(w => w.path.endsWith('/drugConfiscation') && w.body.includes('nueva.png') && !w.body.includes('name="_method"')), 'Contrato de alta alterado');
        passed.push('Alta de droga: padre, opciones, cantidad, peso y archivo conservados ante 422; cierre tras éxito');
        await page.goto(baseURL + '/confiscation/create');
        const newMain = page.locator('form');
        await newMain.getByLabel('Observacion', { exact: true }).fill('Nueva observación');
        await newMain.getByLabel('Dirección', { exact: true }).fill('Nueva dirección');
        await newMain.getByLabel('Departmento', { exact: true }).fill('Departamento nuevo');
        await newMain.getByLabel('Municipalidad', { exact: true }).fill('Municipio nuevo');
        await newMain.getByRole('button', { name: /Choose date/ }).click();
        await page.getByRole('gridcell', { name: '8', exact: true }).click();
        const newMainBefore = await save(newMain, 'Guardar decomiso', async () => {
            check(page.url().endsWith('/confiscation/create'), 'El alta navegó tras fallar');
            check(await newMain.getByLabel('Dirección', { exact: true }).inputValue() === 'Nueva dirección', 'Alta principal perdió dirección');
        });
        await page.waitForURL(baseURL + '/confiscation/edit/7');
        await page.waitForFunction(() => document.querySelector('input[name="observacion"]')?.value === 'Original');
        check(writes.slice(newMainBefore).length === 2 && writes.slice(newMainBefore).every(w => w.path.endsWith('/confiscation') && w.method === 'POST'), 'Contrato de alta principal alterado');
        passed.push('Alta principal: conserva valores y ruta ante fallo; navega a edición solo tras éxito');
        check(errors.length === 0, errors.join('; '));
        return { passed, pageErrors: errors, consoleMessages, writes: writes.length, detailRequests };
    } finally {
        release?.();
        page.off('pageerror', onError);
        page.off('console', onConsole);
        await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
}
