// Requires a real authenticated session at localhost:5174. Creates and deletes
// one uniquely named drug. No HTTP interception; audit entries may remain.
async (page) => {
    const tag = `PORTFOLIO_UI_${Date.now()}`;
    const results = [];
    const pageErrors = [];
    const onError = error => pageErrors.push(error.message);
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    let id;
    page.on('pageerror', onError);
    page.setDefaultTimeout(15000);
    try {
        await page.goto('http://localhost:5174/drug');
        await page.getByRole('button', { name: 'Añadir', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Crear droga' });
        await dialog.getByLabel('Descripción', { exact: true }).fill(tag);
        await dialog.locator('input[type=file]').setInputFiles({
            name: 'portfolio-ui.png', mimeType: 'image/png',
            buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
        });
        const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/drug' && response.request().method() === 'POST');
        await dialog.getByRole('button', { name: 'Guardar droga', exact: true }).click();
        const response = await responsePromise;
        const created = await response.json();
        id = created.identificador;
        check(response.ok() && id !== undefined, 'Create failed or no ID returned');
        await dialog.waitFor({ state: 'hidden' });
        const row = page.getByRole('row').filter({ hasText: tag });
        await row.waitFor();
        results.push({ name: 'UI multipart create and list invalidation', status: 'PASS' });
        await page.reload();
        await row.waitFor();
        results.push({ name: 'UI persistence and cookie session after reload', status: 'PASS' });
        const image = row.locator('img');
        const imageInfo = await image.count() ? await image.evaluate(img => ({ loaded: img.complete && img.naturalWidth > 0 })) : { loaded: false };
        imageInfo.invalidBase = await page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('/undefined/')));
        results.push({ name: 'Stored image displayed in table', status: imageInfo.loaded ? 'PASS' : 'FAIL', ...imageInfo });
        await row.getByRole('menuitem', { name: 'Editar', exact: true }).click();
        const edit = page.getByRole('dialog', { name: 'Editar droga' });
        check(await edit.getByLabel('Descripción', { exact: true }).inputValue() === tag, 'Edit initial values lost');
        await edit.getByLabel('Descripción', { exact: true }).fill(tag + '_UPDATED');
        await edit.getByRole('button', { name: 'Guardar droga', exact: true }).click();
        await edit.waitFor({ state: 'hidden' });
        const updated = page.getByRole('row').filter({ hasText: tag + '_UPDATED' });
        await updated.waitFor();
        const stored = await page.evaluate(async tag => {
            const { drugService } = await import('/src/modules/drug/services/drugService.ts');
            const list = await drugService.list({ page: 1, per_page: 10, sortBy: 'id', orderType: 'asc', search_by: 'descripcion', valueSearch: tag });
            return list.rows[0];
        }, tag);
        check(stored?.descripcion === tag + '_UPDATED' && stored.logo === created.logo, 'Edit did not preserve stored image');
        results.push({ name: 'UI update with existing image preserved', status: 'PASS' });
        await updated.getByRole('menuitem', { name: 'Borrar', exact: true }).click();
        await page.getByRole('dialog', { name: 'Borrar droga' }).getByRole('button', { name: 'Borrar', exact: true }).click();
        await updated.waitFor({ state: 'hidden' });
        const absent = await page.evaluate(async tag => {
            const { drugService } = await import('/src/modules/drug/services/drugService.ts');
            return (await drugService.list({ page: 1, per_page: 10, sortBy: 'id', orderType: 'asc', search_by: 'descripcion', valueSearch: tag })).rows.length === 0;
        }, tag);
        check(absent, 'Deleted fixture still readable');
        id = undefined;
        results.push({ name: 'UI delete and list invalidation', status: 'PASS' });
    } catch (error) {
        results.push({ name: 'UI flow', status: 'FAIL', error: error.message });
    } finally {
        if (id !== undefined) {
            try {
                await page.evaluate(async id => {
                    const { drugService } = await import('/src/modules/drug/services/drugService.ts');
                    await drugService.remove(id);
                }, id);
                results.push({ name: 'cleanup drug fixture', status: 'PASS' });
            } catch (error) { results.push({ name: 'cleanup drug fixture', status: 'FAIL', id, error: error.message }); }
        }
        page.off('pageerror', onError);
    }
    return { tag, results, pageErrors };
}
