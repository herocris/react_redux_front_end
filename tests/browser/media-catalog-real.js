// P07: real UI/API and own fixtures only. HTTP interception is limited to
// explicitly labelled 403/404 image fallback cases, removed in finally.
async (page) => {
    page.setDefaultTimeout(12000);
    const report = { passed: [], media: [], cleanup: [], pageErrors: [] };
    const errorListener = error => report.pageErrors.push(error.message);
    page.on('pageerror', errorListener);
    const check = (value, message) => { if (!value) throw new Error(message); };
    const tag = `PORTFOLIO_P07_UI_${Date.now()}`;
    let id, imageRoute;
    const trackUrls = async () => page.evaluate(() => {
        const created = [], revoked = [];
        const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
        URL.createObjectURL = file => { const url = create(file); created.push(url); return url; };
        URL.revokeObjectURL = url => { revoked.push(url); revoke(url); };
        window.__p07Urls = { created, revoked, restore: () => { URL.createObjectURL = create; URL.revokeObjectURL = revoke; } };
    });
    const urlsReleased = async () => {
        const state = await page.evaluate(() => {
            const { created, revoked } = window.__p07Urls;
            return { created: created.length, released: created.every(url => revoked.includes(url)) };
        });
        check(state.created > 0 && state.released, 'Object URL not released');
        await page.evaluate(() => window.__p07Urls.restore());
    };
    const loaded = async image => {
        await image.waitFor();
        await image.evaluate(img => img.decode());
        check(await image.evaluate(img => img.naturalWidth === 32), 'Image did not decode');
    };
    try {
        await page.goto('http://localhost:5174/drug');
        const png = async color => Buffer.from(await page.evaluate(color => {
            const c = document.createElement('canvas'); c.width = c.height = 32;
            const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0, 0, 32, 32);
            return c.toDataURL('image/png').split(',')[1];
        }, color), 'base64');
        const blue = await png('blue'), red = await png('red');
        const verifyDelivery = async (reference, expected) => {
            const url = await page.evaluate(async reference => (await import('/src/helpers/getMediaUrl.ts')).getMediaUrl(reference), reference);
            check(url?.startsWith('http://localhost/storage/'), 'Wrong media base');
            const response = await page.request.get(url);
            check(response.status() === 200 && response.headers()['content-type'].startsWith('image/png'), 'Media delivery failed');
            check((await response.body()).equals(expected), 'Delivered bytes differ from uploaded file');
            report.media.push({ status: response.status(), contentType: response.headers()['content-type'], bytesMatch: true });
            return url;
        };
        const save = async (dialog, path) => {
            const pending = page.waitForResponse(r => new URL(r.url()).pathname === path && r.request().method() === 'POST');
            await dialog.getByRole('button', { name: 'Guardar droga', exact: true }).click();
            const response = await pending;
            check(response.ok(), 'Save failed: ' + response.status());
            const body = await response.json();
            await dialog.waitFor({ state: 'hidden' });
            return body;
        };
        await trackUrls();
        await page.getByRole('button', { name: 'Añadir', exact: true }).click();
        let dialog = page.getByRole('dialog', { name: 'Crear droga' });
        await dialog.getByLabel('Descripción', { exact: true }).fill(tag);
        await dialog.locator('input[type=file]').setInputFiles({ name: 'p07-blue.png', mimeType: 'image/png', buffer: blue });
        await loaded(dialog.locator('img[src^="blob:"]'));
        const created = await save(dialog, '/api/drug'); id = created.identificador;
        await urlsReleased();
        let row = page.getByRole('row').filter({ hasText: tag });
        await loaded(row.locator('img'));
        await verifyDelivery(created.logo, blue);
        report.passed.push('real UI create: blob preview released, persisted file delivered byte-for-byte and rendered');
        await page.reload(); await loaded(row.locator('img'));
        await row.screenshot({ path: '.playwright-mcp/p07-catalog.png' });
        report.passed.push('saved logo renders after full reload');
        await row.getByRole('menuitem', { name: 'Editar', exact: true }).click();
        dialog = page.getByRole('dialog', { name: 'Editar droga' });
        await loaded(dialog.locator('img'));
        await dialog.getByLabel('Descripción', { exact: true }).fill(tag + '_UPDATED');
        const kept = await save(dialog, '/api/drug/' + id);
        check(kept.logo === created.logo, 'Existing reference changed without replacement');
        report.passed.push('existing PhotoInput preview and edit without replacement preserve exact reference');
        await trackUrls();
        await row.getByRole('menuitem', { name: 'Editar', exact: true }).click();
        dialog = page.getByRole('dialog', { name: 'Editar droga' });
        await dialog.locator('input[type=file]').setInputFiles({ name: 'p07-red.png', mimeType: 'image/png', buffer: red });
        await loaded(dialog.locator('img[src^="blob:"]'));
        const replaced = await save(dialog, '/api/drug/' + id);
        check(replaced.logo !== kept.logo, 'Replacement kept old reference');
        await urlsReleased();
        const currentUrl = await verifyDelivery(replaced.logo, red);
        await page.reload(); await loaded(row.locator('img'));
        report.passed.push('replacement persists new reference, delivers new bytes and renders after reload; blob released');
        for (const status of [403, 404]) {
            imageRoute = route => route.fulfill({ status, contentType: 'text/plain', body: 'P07 simulated unavailable image' });
            await page.route(currentUrl, imageRoute);
            try {
                await page.reload(); await row.waitFor();
                await page.waitForFunction(tag => {
                    const row = [...document.querySelectorAll('[role="row"]')].find(el => el.textContent.includes(tag));
                    return row && !row.querySelector('img') && row.querySelector('.MuiAvatar-root')?.textContent === 'P';
                }, tag);
                await row.getByRole('menuitem', { name: 'Editar', exact: true }).click();
                dialog = page.getByRole('dialog', { name: 'Editar droga' });
                await dialog.getByRole('img', { name: 'Imagen no disponible', exact: true }).waitFor();
                check(await dialog.getByRole('button', { name: 'Eliminar imagen 1' }).isVisible(), 'Existing image value lost on load error');
                if (status === 404) await dialog.screenshot({ path: '.playwright-mcp/p07-fallback.png' });
                await page.keyboard.press('Escape');
                report.passed.push(`simulated image HTTP ${status}: visible table/PhotoInput fallbacks retain image control`);
            } finally { await page.unroute(currentUrl, imageRoute); imageRoute = undefined; }
        }
        await page.reload(); await loaded(row.locator('img'));
        const missing = await page.request.get('http://localhost/storage/drug/PORTFOLIO_P07_missing_' + Date.now() + '.png');
        check([403, 404].includes(missing.status()), 'Unexpected missing media status: ' + missing.status());
        report.media.push({ case: 'real nonexistent file', status: missing.status() });
        check(!await page.evaluate(() => performance.getEntriesByType('resource').some(r => /\/undefined\//.test(r.name))), 'Undefined image URL requested');
        report.passed.push(`real ${missing.status()} for missing file; recovery after image failure; no undefined requests`);
    } catch (error) { report.failure = error.message; }
    finally {
        await page.evaluate(() => window.__p07Urls?.restore());
        if (imageRoute) await page.unrouteAll({ behavior: 'ignoreErrors' });
        if (id) {
            try {
                await page.evaluate(async id => (await import('/src/modules/drug/services/drugService.ts')).drugService.remove(id), id);
                report.cleanup.push({ domain: 'drug', id, removed: true });
            } catch { report.cleanup.push({ domain: 'drug', id, removed: false }); }
        }
        await page.goto('http://localhost:5174/dashboard');
        page.off('pageerror', errorListener);
    }
    return report;
}
