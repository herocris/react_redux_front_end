async (page) => {
    // Production preview: npm run preview -- --host 127.0.0.1 --port 4176.
    const baseURL = 'http://127.0.0.1:4176';
    const errors = [];
    const unexpectedConsole = [];
    const scripts = new Set();
    let authenticated = false;
    let releaseChunk;
    const chunkGate = new Promise(resolve => { releaseChunk = resolve; });
    let holdUserChunk = true;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (!['warning', 'error'].includes(message.type())) return;
        if (message.text().startsWith('Failed to load resource:') && message.location().url.endsWith('/refresh')) return;
        if (message.text().startsWith('Canvas2D: Multiple readback operations')) return;
        unexpectedConsole.push(message.text().slice(0, 200));
    };
    const onRequest = request => {
        if (request.resourceType() === 'script') scripts.add(new URL(request.url()).pathname);
    };
    page.on('pageerror', onError);
    page.on('console', onConsole);
    page.on('request', onRequest);
    page.setDefaultTimeout(10000);
    await page.route('**/*', async route => {
        const request = route.request();
        if (holdUserChunk && /\/UserRoutes-[^/]+\.js$/.test(new URL(request.url()).pathname)) {
            await chunkGate;
            return route.fallback();
        }
        if (!['fetch', 'xhr'].includes(request.resourceType())) return route.fallback();
        if (request.url().endsWith('/refresh')) {
            return route.fulfill({ status: authenticated ? 200 : 401, json: authenticated
                ? { user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: ["dashboard","drug","graph","map","weapon","ammunition","confiscation","drugConfiscation","weaponConfiscation","ammunitionConfiscation","drugPresentation","user","role","permission","activity"].flatMap(domain => (['dashboard', 'graph', 'map', 'activity'].includes(domain) ? ['view'] : ['view', 'create', 'update', 'delete']).map(action => domain + '.' + action)) }
                : { message: 'Sin sesión' } });
        }
        return route.fulfill({ json: { data: [] } });
    });
    try {
        await page.goto(baseURL + '/auth/login');
        await page.locator('input[type="password"]').waitFor();
        check(![...scripts].some(path => /Routes-|GraphLayout-|TileLayer-/.test(path)), 'Login loaded protected route chunks');
        const leafletStyled = () => page.evaluate(() => [...document.styleSheets].some(sheet =>
            [...sheet.cssRules].some(rule => rule.cssText.includes('.leaflet-container'))));
        check(!await leafletStyled(), 'Login loaded Leaflet CSS');
        authenticated = true;
        scripts.clear();
        await page.goto(baseURL + '/user');
        await page.getByRole('status', { name: 'Cargando vista' }).waitFor();
        holdUserChunk = false;
        releaseChunk();
        await page.getByRole('grid').waitFor();
        check([...scripts].some(path => /UserRoutes-/.test(path)), 'User chunk not loaded');
        check(![...scripts].some(path => /DashBoardRoutes-|ConfiscationRoutes-|GraphView-|TileLayer-/.test(path)), 'User route loaded unrelated chunks');
        await page.getByRole('button', { name: 'Graphs', exact: true }).filter({ visible: true }).click();
        await page.waitForURL('**/graph');
        await page.locator('form').waitFor();
        check([...scripts].some(path => /GraphView-/.test(path)), 'Graph chunk not loaded');
        await page.getByRole('button', { name: 'Map', exact: true }).filter({ visible: true }).click();
        await page.waitForURL('**/map');
        await page.locator('.leaflet-container').waitFor();
        check(await leafletStyled(), 'Map route missing Leaflet CSS');
        await page.goBack();
        await page.waitForURL('**/graph');
        await page.locator('form').waitFor();
        await page.goto(baseURL + '/confiscation/create');
        await page.getByRole('button', { name: 'Seleccionar ubicación en el mapa', exact: true }).waitFor();
        check(await leafletStyled(), 'Direct confiscation form missing Leaflet CSS');
        await page.getByRole('button', { name: 'Seleccionar ubicación en el mapa', exact: true }).click();
        await page.locator('.leaflet-container').waitFor();
        await page.waitForFunction(() => {
            const map = document.querySelector('.leaflet-container');
            return map && map.getBoundingClientRect().width > 300 && map.getBoundingClientRect().height > 200;
        });
        const mapLayout = await page.locator('.leaflet-container').evaluate(map => ({
            width: map.getBoundingClientRect().width, height: map.getBoundingClientRect().height,
            panePosition: getComputedStyle(map.querySelector('.leaflet-pane')).position,
        }));
        check(mapLayout.width > 300 && mapLayout.height > 200 && mapLayout.panePosition === 'absolute', 'Map layout missing styles');
        check(errors.length === 0, errors.join('; '));
        check(unexpectedConsole.length === 0, unexpectedConsole.join('; '));
        return { passed: ['Login sin chunks protegidos ni CSS Leaflet', 'Indicador accesible mientras carga el chunk', 'Usuarios sin mapas ni otras rutas', 'Navegación a gráficos y mapa con CSS diferido', 'Atrás conserva navegación', 'Entrada directa y mapa de formulario con estilos'], mapLayout, pageErrors: errors, unexpectedConsole };
    } finally {
        releaseChunk();
        page.off('pageerror', onError);
        page.off('console', onConsole);
        page.off('request', onRequest);
        await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
}
