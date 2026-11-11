async (page) => {
    const base = 'http://127.0.0.1:4175';
    const passed = [], errors = [], consoleErrors = [], reads = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    let removed = false, mainRemoved = false, failMain = false, failList = false, failDelete = true, holdDetail = false, release;
    const mainReads = [];
    let expectedErrors = 0;
    const main = id => ({ identificador: Number(id), fecha: '2026-11-08', observacion: 'Padre ' + id,
        direccion: 'Dirección', departamento: 'Depto', municipalidad: 'Municipio', latitud: 1, longitud: 2 });
    const sub = (id, parent = 7) => ({ identificador: id, cantidad: 3, peso: 1.5, foto: 'existente.png',
        decomiso: { identificador: parent }, droga: { identificador: 1, descripcion: 'Droga ' + parent },
        presentacion: { identificador: 2, descripcion: 'Presentación' } });
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (message.text().startsWith('Failed to load resource:')) { expectedErrors++; return; }
        if (['warning', 'error'].includes(message.type())) consoleErrors.push(message.text().slice(0, 200));
    };
    const routeHandler = async route => {
        const request = route.request(), url = new URL(request.url());
        if (request.resourceType() === 'image') return route.fulfill({ contentType: 'image/png',
            body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        if (!['fetch', 'xhr'].includes(request.resourceType()) || /\.(tsx?|m?js)$/.test(url.pathname)) return route.fallback();
        if (url.pathname.endsWith('/refresh')) return route.fulfill({ json: {
            user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: [] } });
        if (request.method() === 'DELETE') {
            if (failDelete) return route.fulfill({ status: 422, json: { error: 'Borrado rechazado' } });
            if (/\/confiscation\/11$/.test(url.pathname)) mainRemoved = true;
            else removed = true;
            return route.fulfill({ json: {} });
        }
        const detail = url.pathname.match(/\/confiscation\/(7|9)$/);
        if (detail) {
            if (detail[1] === '7' && holdDetail) {
                await new Promise(resolve => { release = resolve; });
            }
            return route.fulfill({ json: main(detail[1]) });
        }
        const nested = url.pathname.match(/\/drugConfiscation\/(7|9)\/confiscation$/);
        if (nested) {
            const p = Number(url.searchParams.get('page'));
            reads.push({ parent: nested[1], page: p });
            if (failList) return route.fulfill({ status: 503, json: { error: 'Sublistado no disponible' } });
            const total = nested[1] === '9' ? 1 : removed ? 10 : 11;
            const rows = nested[1] === '9' ? [sub(12, 9)] : p === 2 ? removed ? [] : [sub(11)] :
                Array.from({ length: 10 }, (_, i) => sub(i + 1));
            return route.fulfill({ json: { data: rows, total, current_page: p, per_page: 10, last_page: Math.ceil(total / 10) } });
        }
        const domain = url.pathname.split('/').at(-1);
        if (domain === 'confiscation' && !/Confiscation\//.test(url.pathname)) {
            const p = Number(url.searchParams.get('page'));
            mainReads.push({ page: p, sort: url.searchParams.get('sort_by'), order: url.searchParams.get('type') });
            if (failMain) return route.fulfill({ status: 503, json: { error: 'Listado principal no disponible' } });
            const total = mainRemoved ? 10 : 11;
            const rows = Array.from({ length: total }, (_, i) => main(i + 1));
            return route.fulfill({ json: { data: rows.slice((p - 1) * 10, p * 10), total,
                current_page: p, per_page: 10, last_page: Math.ceil(total / 10) } });
        }
        const option = { drug: [1, 'Droga 7'], drugPresentation: [2, 'Presentación'] }[domain];
        return route.fulfill({ json: { data: option ? [{ identificador: option[0], descripcion: option[1] }] : [],
            total: option ? 1 : 0, current_page: 1, last_page: 1, per_page: 10 } });
    };
    const appModule = async path => page.evaluate(async path => {
        const resource = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname === path);
        if (!resource) throw new Error('Módulo no cargado: ' + path);
        return resource.name;
    }, path);
    page.setDefaultTimeout(10000);
    page.on('pageerror', onError); page.on('console', onConsole);
    await page.route('**/*', routeHandler);
    try {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(base + '/confiscation/edit/7');
        const panel = page.locator('#panel1-header').locator('..').locator('..');
        await panel.getByText('1–10 of 11', { exact: true }).waitFor();
        await panel.getByRole('button', { name: 'Go to next page' }).click();
        await panel.getByText('11–11 of 11', { exact: true }).waitFor();
        await panel.getByRole('button').filter({ hasText: 'Droga 7' }).click();
        await panel.getByLabel('Cantidad', { exact: true }).fill('9');
        await panel.getByRole('button', { name: 'Borrar subdecomiso', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Borrar', exact: true });
        await dialog.getByRole('button', { name: 'Ok', exact: true }).click();
        await dialog.getByText('Borrado rechazado').waitFor();
        check(await panel.getByLabel('Cantidad', { exact: true }).inputValue() === '9', 'Borrado fallido perdió borrador');
        failDelete = false;
        await dialog.getByRole('button', { name: 'Ok', exact: true }).click();
        await dialog.waitFor({ state: 'detached' });
        await panel.getByText('1–10 of 10', { exact: true }).waitFor();
        check(reads.at(-1).page === 1, 'No recuperó página vacía desde servidor');
        passed.push('borrado fallido conserva edición; reintento cierra y vuelve de página vacía con total remoto');

        failList = true;
        const clientURL = await appModule('/src/queries/queryClient.ts');
        await page.evaluate(async url => {
            const { queryClient } = await import(url);
            await queryClient.invalidateQueries({ queryKey: ['drugConfiscation', '7'] });
        }, clientURL);
        await panel.getByText('Sublistado no disponible').waitFor();
        check(await panel.getByRole('button', { name: 'Añadir subdecomiso' }).isDisabled(), 'Permite editar listado fallido');
        failList = false;
        await panel.getByRole('button', { name: 'Reintentar listado' }).click();
        await panel.getByText('Sublistado no disponible').waitFor({ state: 'detached' });
        passed.push('recarga fallida conserva filas y muestra reintento sin permitir selección obsoleta');

        await page.getByLabel('Observacion', { exact: true }).fill('Borrador sin guardar');
        await panel.getByRole('button', { name: 'Añadir subdecomiso' }).click();
        await panel.getByLabel('Cantidad', { exact: true }).fill('6');
        await page.evaluate(async url => {
            const { queryClient } = await import(url);
            await queryClient.invalidateQueries({ queryKey: ['confiscation', 'detail', 7] });
            await queryClient.invalidateQueries({ queryKey: ['drugConfiscation', '7'] });
        }, clientURL);
        check(await page.getByLabel('Observacion', { exact: true }).inputValue() === 'Borrador sin guardar', 'Recarga perdió borrador principal');
        check(await panel.getByLabel('Cantidad', { exact: true }).inputValue() === '6', 'Recarga perdió borrador hijo');
        await page.screenshot({ path: '.playwright-mcp/confiscation-query.png', fullPage: true });
        passed.push('recargas de padre e hijo conservan ambos borradores y selección vacía sin avisos MUI');

        holdDetail = true;
        const old = page.evaluate(async url => {
            const { queryClient } = await import(url);
            await queryClient.invalidateQueries({ queryKey: ['confiscation', 'detail', 7] });
        }, clientURL);
        await page.waitForFunction(() => document.querySelector('[aria-label="Cargando decomiso"]'));
        // Client navigation keeps the same QueryClient, exercising the parent key.
        await page.evaluate(() => {
            history.pushState({}, '', '/confiscation/edit/9');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        await page.waitForFunction(() => document.querySelector('input[name="observacion"]')?.value === 'Padre 9');
        release(); await old;
        await panel.getByText('Droga 9', { exact: true }).waitFor();
        check(await page.getByLabel('Observacion', { exact: true }).inputValue() === 'Padre 9', 'Detalle tardío contaminó otro padre');
        check(await panel.locator('form').count() === 0, 'Borrador hijo sobrevivió al cambio de padre');
        passed.push('cambio de padre reinicia edición; respuesta tardía del detalle anterior no contamina');
        await page.getByRole('button', { name: 'Confiscations', exact: true }).click();
        await page.getByText('1–10 of 11', { exact: true }).waitFor();
        await page.locator('[data-field="observacion"][role="columnheader"]').click();
        await page.getByRole('button', { name: 'Go to next page' }).click();
        await page.getByText('11–11 of 11', { exact: true }).waitFor();
        await page.getByRole('row').filter({ hasText: 'Padre 11' }).getByRole('menuitem', { name: 'Delete' }).click();
        failDelete = true;
        await dialog.getByRole('button', { name: 'Ok', exact: true }).click();
        await dialog.getByText('Borrado rechazado').waitFor();
        failDelete = false;
        await dialog.getByRole('button', { name: 'Ok', exact: true }).click();
        await dialog.waitFor({ state: 'detached' });
        await page.getByText('1–10 of 10', { exact: true }).waitFor();
        check(mainReads.at(-1).page === 1 && mainReads.at(-1).sort === 'observacion', 'Listado principal perdió orden al recuperar página');
        passed.push('listado principal controlado: error de borrado, reintento, total y página vacía conservando orden');
        failMain = true;
        await page.evaluate(async url => {
            const { queryClient } = await import(url);
            await queryClient.invalidateQueries({ queryKey: ['confiscation', 'list'] });
        }, clientURL);
        await page.getByText('Listado principal no disponible').waitFor();
        check(await page.getByRole('row').filter({ hasText: 'Padre 1' }).count() > 0, 'Error principal ocultó filas');
        failMain = false;
        await page.getByRole('button', { name: 'Reintentar listado', exact: true }).click();
        await page.getByText('Listado principal no disponible').waitFor({ state: 'detached' });
        passed.push('fallo y reintento del listado principal conserva filas');
        check(!errors.length && !consoleErrors.length, JSON.stringify({ errors, consoleErrors }));
        return { passed, reads, mainReads, expectedErrors, pageErrors: errors.length, unexpectedConsole: consoleErrors.length };
    } finally {
        release?.();
        await page.unroute('**/*', routeHandler);
        page.off('pageerror', onError); page.off('console', onConsole);
    }
}
