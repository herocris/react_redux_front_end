async (page) => {
    const passed = [];
    const errors = [];
    const consoleErrors = [];
    const requests = [];
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (['warning', 'error'].includes(message.type())) consoleErrors.push(message.text().slice(0, 200));
    };
    const onRequest = request => {
        if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url());
    };
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    page.on('pageerror', onError);
    page.on('console', onConsole);
    try {
        await page.evaluate(async () => {
            const resource = pattern => performance.getEntriesByType('resource').find(entry => pattern.test(entry.name))?.name;
            document.querySelectorAll('#entity-list-fixture').forEach(node => node.remove());
            const reactModule = await import(resource(/deps\/react\.js/));
            const React = reactModule.default || reactModule;
            const client = await import(resource(/deps\/react-dom_client\.js/));
            const { createRoot } = client.default || client;
            const { EntityList } = await import(resource(/\/src\/components\/EntityList\.tsx/));
            const host = document.createElement('div');
            host.id = 'entity-list-fixture';
            Object.assign(host.style, { position: 'fixed', inset: '0', zIndex: '2000', background: 'white', height: '600px' });
            document.body.append(host);
            const root = createRoot(host);
            const row = { id: 7, nombre: 'Controlled' };
            const events = [];
            let models = {
                paginationModel: { page: 0, pageSize: 5 },
                sortModel: [{ field: 'nombre', sort: 'desc' }],
                filterModel: { items: [] },
            };
            let actions = true;
            const render = () => root.render(React.createElement(EntityList, {
                rows: [row], columns: [{ field: 'id' }, { field: 'nombre', flex: 1 }],
                loading: false, rowCount: 30, ...models,
                onPaginationModelChange: model => { events.push(['page', model]); models.paginationModel = model; render(); },
                onSortModelChange: model => { events.push(['sort', model]); models.sortModel = model; render(); },
                onFilterModelChange: model => { events.push(['filter', model]); models.filterModel = model; render(); },
                onEdit: actions ? selected => events.push(['edit', selected === row, selected.id]) : undefined,
                onDelete: actions ? selected => events.push(['delete', selected === row, selected.id]) : undefined,
            }));
            window.__entityListFixture = {
                events,
                update: (next, showActions = true) => { models = { ...models, ...next }; actions = showActions; render(); },
                dispose: () => { root.unmount(); host.remove(); delete window.__entityListFixture; },
            };
            render();
        });
        page.on('request', onRequest);
        const fixture = page.locator('#entity-list-fixture');
        await fixture.getByRole('gridcell', { name: 'Controlled', exact: true }).waitFor();
        await fixture.getByRole('menuitem', { name: 'Edit', exact: true }).click();
        await fixture.getByRole('menuitem', { name: 'Delete', exact: true }).click();
        check(await page.evaluate(() => window.__entityListFixture.events.filter(e => ['edit', 'delete'].includes(e[0])).every(e => e[1] && e[2] === 7)), 'Actions lost row identity or numeric id');
        passed.push('explicit callbacks receive the original row and numeric identifier');
        check(await fixture.locator('[data-field="nombre"][role="columnheader"]').getAttribute('aria-sort') === 'descending', 'Initial controlled sort missing');
        await fixture.getByRole('button', { name: 'Go to next page' }).click();
        await page.waitForFunction(() => window.__entityListFixture.events.some(e => e[0] === 'page' && e[1].page === 1));
        await fixture.locator('[data-field="nombre"][role="columnheader"]').click();
        await page.waitForFunction(() => window.__entityListFixture.events.some(e => e[0] === 'sort'));
        passed.push('pagination and sort events update the consumer models');
        await page.evaluate(() => window.__entityListFixture.update({
            paginationModel: { page: 3, pageSize: 5 },
            sortModel: [{ field: 'nombre', sort: 'asc' }],
            filterModel: { items: [{ id: 1, field: 'nombre', operator: 'contains', value: 'Applied' }] },
        }, false));
        await fixture.getByText('16–20 of 30', { exact: true }).waitFor();
        check(await fixture.locator('[data-field="nombre"][role="columnheader"]').getAttribute('aria-sort') === 'ascending', 'External sort reset missing');
        check(await fixture.getByRole('menuitem', { name: /Edit|Delete/ }).count() === 0, 'Read-only renders actions');
        const header = fixture.locator('[data-field="nombre"][role="columnheader"]');
        await header.hover();
        await header.getByRole('button', { name: 'Show filters' }).click();
        await page.getByRole('textbox', { name: 'Value', exact: true }).waitFor();
        check(await page.getByRole('textbox', { name: 'Value', exact: true }).inputValue() === 'Applied', 'External controlled filter missing');
        await page.getByRole('textbox', { name: 'Value', exact: true }).fill('Changed');
        await page.waitForFunction(() => window.__entityListFixture.events.some(e => e[0] === 'filter' && e[1].items[0]?.value === 'Changed'));
        passed.push('external page/sort/filter reset, filter events and read-only presentation');
        check(requests.length === 0, 'Presentation initiated an HTTP request');
        check(errors.length === 0 && consoleErrors.length === 0, 'Unexpected browser errors');
        return { passed, requests: requests.length, errors, consoleErrors };
    } finally {
        await page.evaluate(() => window.__entityListFixture?.dispose());
        page.off('pageerror', onError);
        page.off('console', onConsole);
        page.off('request', onRequest);
    }
}
