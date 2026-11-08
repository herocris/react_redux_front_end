async (page) => {
    const baseURL = 'http://127.0.0.1:4175';
    const errors = [];
    const scripts = new Set();
    let authenticated = false;
    let releaseChunk;
    const chunkGate = new Promise(resolve => { releaseChunk = resolve; });
    let holdUserChunk = true;
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onRequest = request => {
        if (request.resourceType() === 'script') scripts.add(new URL(request.url()).pathname);
    };
    page.on('pageerror', onError);
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
                ? { user: { name: 'Prueba', email: 'test@example.test' }, roles: [], permissions: [] }
                : { message: 'Sin sesión' } });
        }
        return route.fulfill({ json: { data: [] } });
    });
    try {
        await page.goto(baseURL + '/auth/login');
        await page.locator('input[type="password"]').waitFor();
        check(![...scripts].some(path => /Routes-|GraphLayout-|TileLayer-/.test(path)), 'Login loaded protected route chunks');
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
        await page.goBack();
        await page.waitForURL('**/graph');
        await page.locator('form').waitFor();
        await page.goto(baseURL + '/confiscation/create');
        await page.getByRole('button', { name: 'Seleccionar ubicación en el mapa', exact: true }).waitFor();
        check(errors.length === 0, errors.join('; '));
        return { passed: ['Login sin chunks protegidos', 'Indicador accesible mientras carga el chunk', 'Usuarios sin mapas ni otras rutas', 'Navegación a gráficos y mapa', 'Atrás conserva navegación', 'Entrada directa a formulario anidado'], pageErrors: errors };
    } finally {
        releaseChunk();
        page.off('pageerror', onError);
        page.off('request', onRequest);
        await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
}
