// Read-only P02 verification. Requires the existing authenticated local demo session.
async (page) => {
    const base = 'http://localhost:5174';
    const passed = [], errors = [], detailRequests = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onRequest = request => {
        if (/\/api\/confiscation\/[^/?]+$/.test(request.url())) detailRequests.push(new URL(request.url()).pathname);
    };
    page.setDefaultTimeout(15000);
    page.on('pageerror', onError);
    page.on('request', onRequest);
    const navigate = async path => {
        await page.evaluate(path => {
            window.history.pushState({}, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
        }, path);
    };
    try {
        await page.goto(base + '/user');
        await page.getByRole('menuitem', { name: 'Editar', exact: true }).first().click();
        const role = page.getByRole('dialog').getByRole('combobox', { name: /^Roles/ });
        check((await role.innerText()).trim().length > 0, 'Existing user role is not selected');
        await role.click();
        check(await page.getByRole('option', { selected: true }).count() > 0, 'Role option selection missing');
        await page.keyboard.press('Escape');
        await page.keyboard.press('Escape');
        passed.push('user numeric role selected');

        await navigate('/rol');
        await page.getByRole('menuitem', { name: 'Editar', exact: true }).first().click();
        const permissions = page.getByRole('dialog').getByRole('combobox', { name: /^Permisos/ });
        check((await permissions.innerText()).includes('user.view'), 'Existing permissions missing');
        await permissions.click();
        check(await page.getByRole('option', { selected: true }).count() > 0, 'Permission options not selected');
        await page.keyboard.press('Escape');
        await page.keyboard.press('Escape');
        passed.push('role numeric permissions selected');

        await navigate('/confiscation');
        await page.getByRole('columnheader', { name: /observacion/i }).waitFor();
        await page.waitForFunction(async () => {
            const { queryClient } = await import('/src/queries/queryClient.ts');
            return queryClient.isFetching() === 0;
        });
        await page.getByRole('menuitem', { name: 'Editar', exact: true }).first().click();
        await page.getByText('Editar decomiso', { exact: true }).waitFor();
        check(/\/confiscation\/edit\/\d+$/.test(page.url()), 'List did not navigate to numeric detail/edit');
        passed.push('list to detail/edit navigation');

        // Parent and labels observed in the real ID audit; no writes or fixtures.
        await navigate('/confiscation/edit/2252');
        await page.getByRole('button', { name: /droga quo/ }).click();
        check((await page.getByRole('combobox', { name: /^Droga/ }).innerText()).includes('droga quo'), 'Drug relation lost');
        check((await page.getByRole('combobox', { name: /^Presentación/ }).innerText()).includes('presentacion droga id'), 'Presentation relation lost');
        passed.push('child numeric relations selected');

        const beforeAlias = detailRequests.length;
        await navigate('/confiscation/edit/02252');
        await page.getByText('Editar decomiso', { exact: true }).waitFor();
        const keys = await page.evaluate(async () => {
            const { queryClient } = await import('/src/queries/queryClient.ts');
            return queryClient.getQueryCache().getAll().filter(query =>
                query.queryKey[0] === 'confiscation' && query.queryKey[1] === 'detail' &&
                Number(query.queryKey[2]) === 2252).map(query => query.queryKey);
        });
        check(keys.length === 1 && keys[0][2] === 2252, 'Duplicate or textual detail cache key');
        check(detailRequests.length === beforeAlias, 'Fresh alias unexpectedly refetched detail');
        passed.push('URL aliases share numeric Query cache');

        const beforeInvalid = detailRequests.length;
        await navigate('/confiscation/edit/7abc');
        await page.getByRole('alert').filter({ hasText: 'Identificador de ruta no válido.' }).waitFor();
        check(detailRequests.length === beforeInvalid, 'Invalid route sent detail HTTP request');
        await navigate('/confiscation');
        await page.getByRole('grid').waitFor();
        check(errors.length === 0, errors.join('; '));
        passed.push('invalid URL rejected before Query/HTTP; navigation recovered');
        return { passed, pageErrors: errors, detailRequests };
    } finally {
        page.off('pageerror', onError);
        page.off('request', onRequest);
    }
}
