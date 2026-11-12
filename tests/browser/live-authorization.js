// P05: isolated HTTP simulation, including responses that outlive revocation.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(10000);
    await view.clock.install();
    const passed = [], errors = [], warnings = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    let permissions = ['drug.view', 'drug.create', 'drug.update'], roles = [], refreshes = 0, writes = 0, reads = 0;
    let refreshStatus = 200, denyWrite = false, heldRead, heldWrite, releaseRead, releaseWrite;
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    view.on('pageerror', error => errors.push(error.message));
    view.on('console', msg => {
        if (['warning', 'error'].includes(msg.type()) && !/Failed to load resource:|Canvas2D:/.test(msg.text())) warnings.push(msg.text().slice(0, 200));
    });
    await context.route('**/*', async route => {
        const req = route.request();
        if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: png });
        if (!['xhr', 'fetch'].includes(req.resourceType())) return route.fallback();
        const path = new URL(req.url()).pathname.replace(/^\/api\//, '');
        if (path === 'refresh') { refreshes++; return route.fulfill({ status: refreshStatus,
            json: refreshStatus === 200 ? { user: { name: 'P05 fixture', email: 'fixture@example.test' }, permissions, roles } : { error: 'Forbidden refresh' } }); }
        if (path === 'logout') return route.fulfill({ json: {} });
        if (req.method() !== 'GET') {
            writes++;
            if (heldWrite) { heldWrite(); await new Promise(resolve => { releaseWrite = resolve; }); }
            return route.fulfill({ status: denyWrite ? 403 : 200,
                json: denyWrite ? { error: 'Denied' } : { identificador: 8, descripcion: 'Committed P05', logo: '' } }).catch(() => {});
        }
        reads++;
        if (heldRead) { heldRead(); await new Promise(resolve => { releaseRead = resolve; }); }
        return route.fulfill({ json: { data: [{ identificador: 7, descripcion: 'Private P05', logo: '' }],
            total: 1, current_page: 1, last_page: 1, per_page: 10 } }).catch(() => {});
    });
    const row = () => view.getByRole('row').filter({ hasText: 'Private P05' });
    const manual = () => view.getByRole('button', { name: 'Actualizar permisos', exact: true }).click();
    const poll = async () => { const before = refreshes; await view.clock.fastForward(61000);
        await view.waitForFunction(() => true); check(refreshes > before, 'Passive poll did not start'); };
    const open = async () => {
        await view.getByRole('button', { name: 'add', exact: true }).click();
        const form = view.getByRole('dialog', { name: 'Crear droga' }).locator('form');
        await form.getByLabel('Descripción', { exact: true }).fill('Draft P05');
        await form.locator('input[type="file"]').setInputFiles({ name: 'p05.png', mimeType: 'image/png', buffer: png });
        return form;
    };
    try {
        await view.goto('http://localhost:5174/drug'); await row().waitFor();
        let form = await open();
        await poll();
        check(await form.getByLabel('Descripción', { exact: true }).inputValue() === 'Draft P05', 'Unchanged poll lost draft');
        check(await form.locator('img[src^="blob:"]').count() === 1, 'Unchanged poll lost file');
        passed.push('Unchanged passive refresh preserves editing text and PNG');
        const afterPoll = refreshes;
        await view.evaluate(() => {
            for (let i = 0; i < 5; i++) { window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); }
        });
        check(refreshes === afterPoll, 'Focus/reconnect burst bypassed passive cooldown');
        await view.evaluate(() => Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }));
        await view.clock.fastForward(61000);
        check(refreshes === afterPoll, 'Hidden tab polled');
        const resumed = view.waitForResponse(response => response.url().endsWith('/refresh'));
        await view.evaluate(() => {
            Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
            document.dispatchEvent(new Event('visibilitychange'));
            window.dispatchEvent(new Event('online'));
        });
        await resumed;
        check(refreshes === afterPoll + 1, 'Resume did not coalesce refresh');
        passed.push('Hidden tab skips polling; focus/reconnect bursts are bounded and visible resume refreshes once');

        permissions = ['drug.view']; await poll();
        await view.getByRole('dialog').waitFor({ state: 'detached' }); await row().waitFor();
        check(await view.getByRole('button', { name: 'add', exact: true }).count() === 0, 'Revoked create survived');
        passed.push('Action revocation tears down form/selection even when view remains allowed');
        permissions = []; await poll();
        await view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        check(await row().count() === 0, 'Idle view kept private rows');
        const deniedReads = reads; await view.clock.fastForward(61000);
        check(reads === deniedReads, 'Denied view refetched private data');
        passed.push('Idle view revocation removes rows, menu and queries without navigation');

        permissions = ['drug.view', 'drug.create']; roles = ['fixture role']; await manual(); await row().waitFor();
        passed.push('Later direct/role assignment recovers same URL and new capabilities');

        let observed;
        const started = new Promise(resolve => { observed = resolve; }); heldRead = observed;
        await view.getByRole('button', { name: /Actualizar permisos/ }).click(); // unchanged does not reload
        await view.getByRole('columnheader').nth(1).click(); await started;
        permissions = []; await manual(); await view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        heldRead = undefined; releaseRead(); releaseRead = undefined;
        check(await row().count() === 0, 'Late read republished private rows');
        permissions = ['drug.view', 'drug.create']; await manual(); await row().waitFor();
        passed.push('Pending read is retired and late response cannot restore revoked data');

        form = await open(); denyWrite = true;
        const before403 = refreshes;
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await view.getByRole('dialog').getByRole('alert').filter({ hasText: 'Acceso denegado.' }).waitFor();
        await view.waitForFunction(() => true);
        check(refreshes === before403 + 1, '403 did not trigger one refresh');
        check(await form.getByLabel('Descripción', { exact: true }).inputValue() === 'Draft P05', '403 with same grants lost draft');
        check(await form.locator('img[src^="blob:"]').count() === 1, '403 with same grants lost file');
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await view.getByRole('dialog').getByRole('alert').filter({ hasText: 'Acceso denegado.' }).waitFor();
        check(refreshes === before403 + 1 && writes === 2, 'Repeated 403 looped or retried write');
        passed.push('403 refresh is bounded, preserves unchanged draft/file and never retries writes');

        await view.clock.fastForward(31000);
        permissions = [];
        const changed403 = refreshes;
        await form.getByRole('button', { name: 'Guardar droga' }).click();
        await view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        check(refreshes === changed403 + 1 && await view.getByRole('dialog').count() === 0, '403 revocation did not retire form');
        permissions = ['drug.view', 'drug.create']; await manual(); await row().waitFor();
        form = await open();
        passed.push('Operation 403 revalidates changed grants and withdraws editing immediately on confirmation');

        denyWrite = false;
        let writing; const writeStarted = new Promise(resolve => { writing = resolve; }); heldWrite = writing;
        await form.getByRole('button', { name: 'Guardar droga' }).click(); await writeStarted;
        permissions = []; await poll(); await view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        heldWrite = undefined; releaseWrite(); releaseWrite = undefined;
        check(await view.getByRole('dialog').count() === 0 && await row().count() === 0, 'Late write restored form/data');
        passed.push('Accepted pending write may commit; its late success cannot publish effects after revocation');

        permissions = ['drug.view']; await manual(); await row().waitFor();
        refreshStatus = 403; await manual();
        await view.getByText('No se pudieron verificar tus permisos.', { exact: false }).waitFor();
        const failures = refreshes; await view.clock.fastForward(121000);
        check(refreshes === failures && await row().count() === 0, 'Failed refresh looped or retained rows');
        refreshStatus = 200; await manual(); await row().waitFor();
        passed.push('Refresh 403 fails closed, stops passive retries and recovers explicitly');
        await view.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await view.waitForURL('**/auth/login');
        check(errors.length === 0 && warnings.length === 0, [...errors, ...warnings].join('; '));
        passed.push('Logout after recovery clears protected UI; no browser exceptions or unexpected warnings');
        return { passed, refreshes, reads, writes, pageErrors: errors, unexpectedConsole: warnings };
    } catch (error) {
        return { passed, failed: error.message, refreshes, reads, writes, pageErrors: errors, unexpectedConsole: warnings,
            dialog: await view.getByRole('dialog').allTextContents() };
    } finally { releaseRead?.(); releaseWrite?.(); await context.close(); }
}
