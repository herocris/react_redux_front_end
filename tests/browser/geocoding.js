async (page) => {
    const currentURL = new URL(page.url());
    const baseURL = ['localhost', '127.0.0.1', '[::1]'].includes(currentURL.hostname)
        ? currentURL.origin : 'http://127.0.0.1:5175';
    await page.setViewportSize({ width: 1440, height: 1000 });
    const results = [];
    const errors = [];
    const consoleMessages = [];
    let externalRequests = 0;
    let backendWrites = 0;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (['warning', 'error'].includes(message.type())) consoleMessages.push(message.text().slice(0, 300));
    };
    page.on('pageerror', onError);
    page.on('console', onConsole);
    page.setDefaultTimeout(8000);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    await page.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.hostname === 'nominatim.openstreetmap.org') {
            externalRequests++;
            return route.abort('blockedbyclient');
        }
        if (url.hostname.endsWith('.tile.openstreetmap.org')) {
            return route.fulfill({ contentType: 'image/png', body: png });
        }
        if (url.origin === baseURL && /\.(tsx?|m?js)$/.test(url.pathname)) return route.fallback();
        if (!['xhr', 'fetch'].includes(request.resourceType())) return route.fallback();
        if (url.pathname.endsWith('/refresh')) {
            return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
                user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: ["confiscation"].flatMap(domain => (['dashboard', 'graph', 'map', 'activity'].includes(domain) ? ['view'] : ['view', 'create', 'update', 'delete']).map(action => domain + '.' + action)),
            }) });
        }
        if (request.method() !== 'GET') backendWrites++;
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    const openMap = () => page.getByRole('button', { name: 'Seleccionar ubicación en el mapa', exact: true }).click();
    const closeMap = () => page.getByRole('button', { name: 'Volver al formulario', exact: true }).click();
    const clickMap = async (x, y, count) => {
        await page.locator('.leaflet-container').click({ position: { x, y } });
        await page.waitForFunction(expected => window.geocodingTest.requests.length === expected, count);
    };
    const complete = (index, address) => page.evaluate(({ index, address }) => {
        const request = window.geocodingTest.requests[index];
        request.finished = true;
        request.resolve({ data: { address } });
    }, { index, address });
    const addressValues = () => Promise.all([
        page.getByLabel('Departmento', { exact: true }).inputValue(),
        page.getByLabel('Municipalidad', { exact: true }).inputValue(),
    ]);

    try {
        await page.goto(baseURL + '/confiscation/create');
        await page.getByRole('button', { name: 'Seleccionar ubicación en el mapa', exact: true }).waitFor();
        await page.evaluate(async () => {
            const source = await (await fetch('/src/modules/confiscation/api/reverseGeocoding.ts')).text();
            const resolved = source.match(/from\s*["']([^"']*axios[^"']*)["']/);
            if (!resolved) throw new Error('Cannot locate the Axios module resolved by Vite');
            const { default: axios } = await import(resolved[1]);
            const originalGet = axios.get;
            window.geocodingTest = { originalGet, requests: [], axios };
            // Deliberately ignore AbortSignal to also verify the hook's identity guard.
            axios.get = (url, config) => {
                if (url !== 'https://nominatim.openstreetmap.org/reverse') return originalGet(url, config);
                return new Promise((resolve, reject) => {
                    window.geocodingTest.requests.push({ signal: config.signal, params: config.params, resolve, reject, finished: false });
                });
            };
        });
        await openMap();
        await page.locator('.leaflet-marker-icon').waitFor();
        await page.evaluate(() => { window.geocodingTest.marker = document.querySelector('.leaflet-marker-icon'); });
        await clickMap(100, 120, 1);
        await clickMap(300, 180, 2);
        check(await page.evaluate(() => window.geocodingTest.requests[0].signal.aborted), 'Old request not cancelled');
        await complete(0, { state: 'Antiguo', municipality: 'Antiguo' });
        await page.getByRole('status').filter({ hasText: 'Buscando dirección' }).waitFor();
        check(await page.getByRole('alert').count() === 0, 'Cancellation showed an error');
        await complete(1, { state: 'Reciente', municipality: 'Municipio reciente' });
        await page.getByRole('status').waitFor({ state: 'detached' });
        check(await page.evaluate(() => window.geocodingTest.marker === document.querySelector('.leaflet-marker-icon')), 'Marker remounted');
        await page.locator('.leaflet-marker-icon').click();
        const expected = await page.evaluate(() => window.geocodingTest.requests[1].params);
        const popup = await page.locator('.leaflet-popup-content').innerText();
        check(popup.includes(expected.lat.toFixed(5)) && popup.includes(expected.lon.toFixed(5)), 'Marker coordinates differ');
        await closeMap();
        check(JSON.stringify(await addressValues()) === JSON.stringify(['Reciente', 'Municipio reciente']), 'Old address overwrote the latest');
        results.push('Dos clics: cancelación, respuesta antigua descartada, marcador estable y coordenadas correctas');

        await openMap();
        await clickMap(150, 100, 3);
        await closeMap();
        check(await page.evaluate(() => window.geocodingTest.requests[2].signal.aborted), 'Closing map did not cancel');
        await complete(2, { state: 'Tardío', city: 'Tardía' });
        check(JSON.stringify(await addressValues()) === JSON.stringify(['', '']), 'Late response changed fields after closing');
        check(await page.locator('.leaflet-container').count() === 0, 'Map not removed');
        results.push('Cerrar durante la consulta: cancelación y ninguna actualización tardía');

        await openMap();
        await clickMap(200, 130, 4);
        check(await page.locator('.leaflet-marker-icon').count() === 1, 'Duplicate marker after reopening');
        await complete(3, { state: 'Departamento parcial' });
        await page.getByRole('alert').filter({ hasText: 'La dirección está incompleta' }).waitFor();
        await page.getByRole('status').waitFor({ state: 'detached' });
        await page.screenshot({ path: '.playwright-mcp/geocoding-warning.png', fullPage: true });
        await closeMap();
        check(JSON.stringify(await addressValues()) === JSON.stringify(['Departamento parcial', '']), 'Invalid partial address');
        await page.getByLabel('Municipalidad', { exact: true }).fill('Municipio manual');
        results.push('Reabrir sin eventos duplicados; respuesta parcial visible y edición manual disponible');

        await openMap();
        await clickMap(250, 140, 5);
        await page.evaluate(() => {
            const request = window.geocodingTest.requests[4];
            request.finished = true;
            request.reject(new Error('Simulated network failure'));
        });
        await page.getByRole('alert').filter({ hasText: 'No se pudo obtener la dirección' }).waitFor();
        await page.getByRole('status').waitFor({ state: 'detached' });
        await clickMap(350, 200, 6);
        check(await page.getByRole('alert').count() === 0, 'Previous error did not clear');
        await complete(5, { state: 'Recuperado', town: 'Pueblo recuperado' });
        await page.getByRole('status').waitFor({ state: 'detached' });
        await closeMap();
        check(JSON.stringify(await addressValues()) === JSON.stringify(['Recuperado', 'Pueblo recuperado']), 'Retry did not recover');
        results.push('Fallo de red visible, fin de carga y recuperación con un nuevo clic');

        await openMap();
        await clickMap(100, 120, 7);
        await clickMap(300, 180, 8);
        await complete(7, { state: 'Último departamento', city: 'Última ciudad' });
        await page.getByRole('status').waitFor({ state: 'detached' });
        await complete(6, { state: 'Respuesta antigua', city: 'Ciudad antigua' });
        await closeMap();
        check(JSON.stringify(await addressValues()) === JSON.stringify(['Último departamento', 'Última ciudad']), 'Late success replaced the current address');
        results.push('La respuesta antigua que llega después del éxito reciente no lo reemplaza');

        await openMap();
        await clickMap(120, 120, 9);
        await clickMap(320, 180, 10);
        await complete(9, { state: 'Dirección vigente', city: 'Ciudad vigente' });
        await page.getByRole('status').waitFor({ state: 'detached' });
        await page.evaluate(() => {
            const request = window.geocodingTest.requests[8];
            request.finished = true;
            request.reject(new Error('Old request failed late'));
        });
        check(await page.getByRole('alert').count() === 0, 'Old failure replaced current success');
        await closeMap();
        check(JSON.stringify(await addressValues()) === JSON.stringify(['Dirección vigente', 'Ciudad vigente']), 'Old failure changed the address');
        results.push('Un error antiguo no muestra avisos tras el éxito reciente');
        check(errors.length === 0, 'Unhandled errors: ' + errors.join('; '));
        check(externalRequests === 0 && backendWrites === 0, 'Unexpected real-service request or write');
        return { passed: results, pageErrors: errors, consoleMessages, externalRequests, backendWrites };
    } finally {
        await page.evaluate(() => {
            const test = window.geocodingTest;
            if (!test) return;
            test.axios.get = test.originalGet;
            for (const request of test.requests) {
                if (!request.finished) request.resolve({ data: {} });
            }
        }).catch(() => {});
        page.off('pageerror', onError);
        page.off('console', onConsole);
        await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
}
