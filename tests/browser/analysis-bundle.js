async (page) => {
    // Run against a production preview on port 4178; HTTP/auth are simulated.
    const passed = [], errors = [], unexpectedConsole = [], scripts = [];
    const pending = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['warning', 'error'].includes(message.type())) return;
        if (!message.text().startsWith('Canvas2D: Multiple readback operations')) unexpectedConsole.push(message.text());
    };
    const onResponse = response => {
        if (response.request().resourceType() !== 'script') return;
        pending.push(response.text().then(body => scripts.push({
            file: new URL(response.url()).pathname,
            dataGrid: body.includes('MuiDataGrid'),
        })));
    };
    const routeHandler = route => {
        if (!['fetch', 'xhr'].includes(route.request().resourceType())) return route.fallback();
        if (route.request().url().endsWith('/refresh')) return route.fulfill({ json: {
            user: { name: 'Performance fixture', email: 'fixture@example.test' }, roles: [], permissions: ["dashboard","drug","graph","map","weapon","ammunition"].flatMap(domain => (['dashboard', 'graph', 'map', 'activity'].includes(domain) ? ['view'] : ['view', 'create', 'update', 'delete']).map(action => domain + '.' + action)),
        } });
        return route.fulfill({ json: { data: [], total: 0, current_page: 1, last_page: 1 } });
    };
    page.on('pageerror', onError); page.on('console', onConsole); page.on('response', onResponse);
    await page.route('**/*', routeHandler);
    try {
        for (const view of ['graph', 'map']) {
            scripts.length = 0; pending.length = 0;
            await page.goto('http://127.0.0.1:4178/' + view);
            await page.locator('form').waitFor();
            if (view === 'map') await page.locator('.leaflet-container').waitFor();
            await Promise.all(pending);
            check(scripts.length > 0 && scripts.every(script => !script.dataGrid), view + ': downloaded DataGrid');
            passed.push(view + ': entrada directa sin descargar DataGrid');
            const sameHeader = await page.evaluate(async () => {
                const header = document.querySelector('main').firstElementChild;
                const form = document.querySelector('form');
                for (let i = 0; i < 2; i++) {
                    document.querySelector('[data-testid=Brightness4Icon],[data-testid=Brightness7Icon]').closest('button').click();
                    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    if (document.querySelector('main').firstElementChild !== header || document.querySelector('form') !== form) return false;
                }
                return true;
            });
            check(sameHeader, view + ': layout header remounted on theme change');
            passed.push(view + ': cambio de tema conserva cabecera y formulario');
        }
        check(!errors.length && !unexpectedConsole.length, JSON.stringify({ errors, unexpectedConsole }));
        return { passed, pageErrors: errors.length, unexpectedConsole: unexpectedConsole.length };
    } finally {
        await Promise.allSettled(pending);
        await page.unroute('**/*', routeHandler);
        page.off('pageerror', onError); page.off('console', onConsole); page.off('response', onResponse);
    }
}
