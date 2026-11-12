// P06 real UI: own parent + six children, last-page deletion and final empty.
async (page) => {
    // Reload modules changed since the raw-contract probe in this same tab.
    await page.goto('http://localhost:5174/dashboard');
    const report = { passed: [], cleanup: [], pageErrors: [], warnings: [] };
    const onError = error => report.pageErrors.push(error.message);
    const onConsole = msg => { if (msg.type() === 'warning') report.warnings.push(msg.text().slice(0, 250)); };
    page.on('pageerror', onError); page.on('console', onConsole);
    const check = (value, message) => { if (!value) throw new Error(message); };
    let fixture;
    try {
        fixture = await page.evaluate(async () => {
            const { confiscationService: parents } = await import('/src/modules/confiscation/services/confiscationService.ts');
            const { drugConfiscationService: children } = await import('/src/modules/drugConfiscation/services/drugConfiscationService.ts');
            const { default: api } = await import('/src/api/graphdataApi.ts');
            const params = { page: 1, per_page: 2, sortBy: 'id', orderType: 'desc', search_by: '', valueSearch: '' };
            const wait = () => new Promise(resolve => setTimeout(resolve, 1300));
            const parent = await parents.create({ fecha: '2026-11-12', observacion: `PORTFOLIO_P06_UI_${Date.now()}`,
                direccion: 'Prueba ficticia', departamento: 'Prueba', municipalidad: 'Prueba', latitud: 14.1, longitud: -87.2 });
            const ids = [];
            // Make cleanup possible even if fixture preparation fails.
            window.__p06 = { parent: parent.id, ids };
            for (const domain of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
                await wait();
                const service = (await import(`/src/modules/${domain}/services/${domain}Service.ts`))[domain + 'Service'];
                const result = await service.list(parent.id, params);
                if (result.tableOptions.total !== 0 || result.tableOptions.current_page !== 1) throw new Error('Real empty normalization failed: ' + domain);
            }
            await wait(); const drug = (await api.get('/drug', { params: { per_page: 2 } })).data.data[0].identificador;
            await wait(); const presentation = (await api.get('/drugPresentation', { params: { per_page: 2 } })).data.data[0].identificador;
            for (let i = 0; i < 6; i++) {
                await wait();
                const foto = new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='), c => c.charCodeAt(0))], 'p06.png', { type: 'image/png' });
                const child = await children.create({ cantidad: 1, peso: 1, decomiso: parent.id, droga: drug, presentacion: presentation, foto });
                ids.push(child.identificador);
            }
            return { parent: parent.id, ids };
        });
        report.passed.push('real first-page empty adaptation in all three services');
        await page.goto(`http://localhost:5174/confiscation/edit/${fixture.parent}`);
        const panel = page.locator('#panel1-header').locator('..').locator('..');
        await panel.getByText('1–6 of 6', { exact: true }).waitFor();
        await panel.getByRole('combobox').click();
        await page.getByRole('option', { name: '5', exact: true }).click();
        await panel.getByText('1–5 of 6', { exact: true }).waitFor();
        await panel.getByRole('button', { name: 'Go to next page' }).click();
        await panel.getByText('6–6 of 6', { exact: true }).waitFor();
        await panel.getByRole('button', { name: 'Borrar subdecomiso', exact: true }).click();
        await page.getByRole('dialog', { name: 'Borrar', exact: true }).getByRole('button', { name: 'Ok', exact: true }).click();
        await panel.getByText('1–5 of 5', { exact: true }).waitFor();
        check(await panel.getByRole('button', { name: 'Go to previous page' }).isDisabled(), 'Did not return to first page');
        report.passed.push('last page row deleted through UI: total 6→5, page 2→1, size 5 retained');
        await page.evaluate(async parent => {
            const { drugConfiscationService: service } = await import('/src/modules/drugConfiscation/services/drugConfiscationService.ts');
            const { queryClient } = await import('/src/queries/queryClient.ts');
            const params = { page: 1, per_page: 10, sortBy: '', orderType: '', search_by: '', valueSearch: '' };
            const remaining = await service.list(parent, params);
            for (const row of remaining.rows) { await new Promise(resolve => setTimeout(resolve, 1300)); await service.remove(row.identificador); }
            await queryClient.invalidateQueries({ queryKey: ['drugConfiscation', parent] });
        }, fixture.parent);
        await panel.getByText('0–0 of 0', { exact: true }).waitFor();
        await panel.getByText('sin registros', { exact: true }).waitFor();
        check(await panel.getByRole('button', { name: 'Go to next page' }).isDisabled(), 'Empty next page enabled');
        report.passed.push('final child removed: empty first page, total zero and disabled pagination');
    } catch (error) { report.failure = error.message; }
    finally {
        // After navigation the original window marker is gone: fixture is the fallback.
        report.cleanup = await page.evaluate(async fixture => {
            const state = fixture ?? window.__p06;
            if (!state) return [];
            const { drugConfiscationService: service } = await import('/src/modules/drugConfiscation/services/drugConfiscationService.ts');
            const { confiscationService: parents } = await import('/src/modules/confiscation/services/confiscationService.ts');
            const result = [];
            try {
                const remaining = await service.list(state.parent, { page: 1, per_page: 10, sortBy: '', orderType: '', search_by: '', valueSearch: '' });
                for (const row of remaining.rows) { await new Promise(resolve => setTimeout(resolve, 1300)); await service.remove(row.identificador); }
                await parents.remove(state.parent); result.push('own children and parent removed');
            } catch { result.push('cleanup failed: inspect own fixture ' + state.parent); }
            delete window.__p06;
            return result;
        }, fixture);
        await page.goto('http://localhost:5174/dashboard');
        page.off('pageerror', onError); page.off('console', onConsole);
    }
    return report;
}
