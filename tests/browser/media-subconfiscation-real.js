// P07 real services and representative UI. Only this run's parent/children
// are changed/deleted. No media files or existing records are modified.
async (page) => {
    page.setDefaultTimeout(12000);
    const report = { passed: [], media: [], cleanup: [], pageErrors: [] };
    const fixtures = [];
    let parent;
    const onError = error => report.pageErrors.push(error.message);
    page.on('pageerror', onError);
    const check = (value, message) => { if (!value) throw new Error(message); };
    const params = { page: 1, per_page: 10, sortBy: 'id', orderType: 'desc', search_by: '', valueSearch: '' };
    const call = async (domain, method, input, png) => {
        await page.waitForTimeout(1300);
        return page.evaluate(async ({ domain, method, input, png }) => {
            const service = (await import(`/src/modules/${domain}/services/${domain}Service.ts`))[domain + 'Service'];
            if (png) input.foto = new File([Uint8Array.from(atob(png), c => c.charCodeAt(0))], 'p07.png', { type: 'image/png' });
            if (method === 'list' && 'parent' in input) return service.list(input.parent, input.params);
            return service[method](input);
        }, { domain, method, input, png });
    };
    try {
        await page.goto('http://localhost:5174/dashboard');
        const png = async color => page.evaluate(color => {
            const c = document.createElement('canvas'); c.width = c.height = 32;
            const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0, 0, 32, 32);
            return c.toDataURL('image/png').split(',')[1];
        }, color);
        const firstPng = await png('green'), replacement = await png('orange');
        const created = await call('confiscation', 'create', { fecha: '2026-11-12', observacion: `PORTFOLIO_P07_SUB_${Date.now()}`,
            direccion: 'Prueba ficticia P07', departamento: 'Prueba', municipalidad: 'Prueba', latitud: 14.1, longitud: -87.2 });
        parent = created.id;
        const verifyDelivery = async (reference, png, domain) => {
            const url = await page.evaluate(async ref => (await import('/src/helpers/getMediaUrl.ts')).getMediaUrl(ref), reference);
            const response = await page.request.get(url);
            check(response.status() === 200, domain + ': file delivery failed ' + response.status());
            check((await response.body()).equals(Buffer.from(png, 'base64')), domain + ': file bytes differ');
            report.media.push({ domain, status: response.status(), contentType: response.headers()['content-type'], bytesMatch: true });
        };
        for (const [domain, relation, catalog] of [
            ['drugConfiscation', 'droga', 'drug'], ['weaponConfiscation', 'arma', 'weapon'], ['ammunitionConfiscation', 'municion', 'ammunition'],
        ]) {
            const list = await call(catalog, 'list', params);
            const input = { cantidad: 1, decomiso: parent, [relation]: list.rows[0].id };
            if (domain === 'drugConfiscation') {
                input.peso = 1;
                input.presentacion = (await call('drugPresentation', 'list', params)).rows[0].id;
            }
            const row = await call(domain, 'create', input, firstPng);
            fixtures.push({ domain, id: row.identificador });
            await verifyDelivery(row.foto, firstPng, domain);
            const kept = await call(domain, 'update', { ...row, cantidad: 2 });
            check(kept.foto === row.foto, domain + ': existing photo reference changed');
            const changed = await call(domain, 'update', { ...kept, cantidad: 3 }, replacement);
            check(changed.foto !== row.foto, domain + ': no replacement reference');
            const read = await call(domain, 'list', { parent, params });
            check(read.rows.length === 1 && read.rows[0].foto === changed.foto, domain + ': persisted reference differs');
            await verifyDelivery(changed.foto, replacement, domain);
            report.passed.push(domain + ': create/read, preserve exact reference without file, replace and deliver new bytes');
        }
        await page.goto(`http://localhost:5174/confiscation/edit/${parent}`);
        const loaded = async image => {
            await image.waitFor(); await image.evaluate(img => img.decode());
            check(await image.evaluate(img => img.naturalWidth === 32), 'Subconfiscation image did not decode');
        };
        for (const index of [1, 2, 3]) {
            const header = page.locator(`#panel${index}-header`);
            if (await header.getAttribute('aria-expanded') !== 'true') await header.click();
            const panel = header.locator('..').locator('..');
            await loaded(panel.locator('img[alt="Foto del subdecomiso"]'));
            await panel.getByRole('button').filter({ has: page.locator('img[alt="Foto del subdecomiso"]') }).click();
            await loaded(panel.locator('img[alt="Vista previa 1"]'));
            if (index === 1) {
                await panel.screenshot({ path: '.playwright-mcp/p07-subconfiscation.png' });
                const pending = page.waitForResponse(r => new URL(r.url()).pathname === '/api/drugConfiscation/' + fixtures[0].id && r.request().method() === 'POST');
                await panel.getByRole('button', { name: 'Guardar', exact: true }).click();
                check((await pending).ok(), 'UI subconfiscation edit failed');
                await loaded(panel.locator('img[alt="Foto del subdecomiso"]'));
                report.passed.push('real drug subconfiscation UI save without replacement returns to rendered list');
            } else {
                await panel.getByRole('button', { name: 'Cancelar', exact: true }).click();
            }
            report.passed.push(`panel ${index}: saved photo and PhotoInput existing reference rendered`);
        }
        await page.reload();
        await loaded(page.locator('#panel1-header').locator('..').locator('..').locator('img[alt="Foto del subdecomiso"]'));
        check(!await page.evaluate(() => performance.getEntriesByType('resource').some(r => /\/undefined\//.test(r.name))), 'Undefined photo request');
        report.passed.push('subconfiscation reload renders persisted file; no undefined requests');
    } catch (error) { report.failure = error.message; }
    finally {
        await page.goto('http://localhost:5174/dashboard');
        for (const fixture of [...fixtures].reverse()) {
            try { await call(fixture.domain, 'remove', fixture.id); report.cleanup.push({ ...fixture, removed: true }); }
            catch {
                // A rejected delivery does not prove that the delete was undone.
                // Read before deciding; never blindly repeat a write.
                try {
                    const remaining = await call(fixture.domain, 'list', { parent, params });
                    report.cleanup.push({ ...fixture, removed: !remaining.rows.some(row => row.identificador === fixture.id), verifiedAfterRejection: true });
                } catch { report.cleanup.push({ ...fixture, removed: false }); }
            }
        }
        if (parent && report.cleanup.every(item => item.removed)) {
            try { await call('confiscation', 'remove', parent); report.cleanup.push({ domain: 'confiscation', id: parent, removed: true }); }
            catch { report.cleanup.push({ domain: 'confiscation', id: parent, removed: false }); }
        }
        page.off('pageerror', onError);
    }
    return report;
}
