// Run with Playwright MCP against the current production build on 4176.
// API, session, files and geocoding are simulated; no real writes or credentials.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(8000);
    const base = 'http://127.0.0.1:4176';
    const passed = [], errors = [], warnings = [], writes = [], contrast = [];
    let authenticated = false, loginFailure = true, saveFailure = true, listFailure = false, graphFailure = false;
    let geoFailure = true;
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    const row = { identificador: 7, descripcion: 'Ejemplo P11', logo: '' };
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    view.on('pageerror', e => errors.push(e.message));
    view.on('console', m => {
        if (['warning', 'error'].includes(m.type()) && !/Failed to load resource|Canvas2D: Multiple readback/.test(m.text())) warnings.push(m.text().slice(0, 250));
    });
    await context.route('**/*', async route => {
        const req = route.request(), url = new URL(req.url()), path = url.pathname;
        if (url.hostname.endsWith('.tile.openstreetmap.org')) return route.fulfill({ contentType: 'image/png', body: png });
        if (url.hostname === 'nominatim.openstreetmap.org') return route.fulfill({ status: geoFailure ? 503 : 200,
            json: geoFailure ? {} : { address: { state: 'Departamento P11', town: 'Municipio P11' } } });
        if (!['xhr', 'fetch'].includes(req.resourceType())) return route.fallback();
        const session = { user: { name: 'Demo', email: 'demo@example.test' }, roles: [],
            permissions: ['dashboard', 'drug', 'weapon', 'ammunition', 'graph', 'map', 'confiscation'].flatMap(d =>
                ['view', 'create', 'update', 'delete'].map(a => d + '.' + a)) };
        if (path.endsWith('/refresh')) return route.fulfill({ status: authenticated ? 200 : 401, json: authenticated ? session : { message: 'Sin sesión' } });
        if (path.endsWith('/login')) {
            if (loginFailure) return route.fulfill({ status: 401, json: { message: 'Acceso rechazado de prueba' } });
            authenticated = true; return route.fulfill({ json: session });
        }
        if (req.method() !== 'GET') {
            writes.push({ path, method: req.method(), file: req.postData()?.includes('p11.png') ?? false });
            return route.fulfill({ status: saveFailure ? 503 : 200, json: saveFailure ? { message: 'Guardado rechazado de prueba' } : row });
        }
        if (path.endsWith('GraphIndex')) return route.fulfill({ status: graphFailure ? 503 : 200,
            json: graphFailure ? { message: 'Análisis rechazado de prueba' } : {
                lineBarData: [{ name: 'Enero', Ejemplo: 12 }, { name: 'Febrero', Ejemplo: 8 }],
                pieData: [{ name: 'Ejemplo', value: 12 }, { name: 'Otro', value: 8 }] } });
        if (path.endsWith('/confiscation/map')) return route.fulfill({ json: { mapItems: [{ id: 7, latitud: 14.265, longitud: -86.568,
            drug_confiscations: [], weapon_confiscations: [], ammunition_confiscations: [] }] } });
        if (listFailure && path.endsWith('/drug')) return route.fulfill({ status: 503, json: { message: 'Listado rechazado de prueba' } });
        return route.fulfill({ json: { data: [row], total: 1, current_page: 1, last_page: 1, per_page: 100 } });
    });
    const noOverflow = async label => check(await view.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label + ': page overflow');
    const focused = locator => locator.evaluate(e => e === document.activeElement);
    const colors = async (label, selector) => {
        contrast.push({ label, samples: await view.locator(selector).evaluateAll(elements => elements.map(e => {
            const s = getComputedStyle(e), backgrounds = [];
            for (let p = e; p; p = p.parentElement) backgrounds.push(getComputedStyle(p).backgroundColor);
            const rgba = value => value.match(/[\d.]+/g).map(Number);
            const composite = (fg, bg) => fg.slice(0, 3).map((c, i) => c * (fg[3] ?? 1) + bg[i] * (1 - (fg[3] ?? 1)));
            const luminance = rgb => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
                .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
            let bg = [255, 255, 255];
            for (const value of backgrounds.reverse()) bg = composite(rgba(value), bg);
            const a = luminance(composite(rgba(s.color), bg)), b = luminance(bg);
            return { text: e.textContent?.trim().slice(0, 40), color: s.color,
                ratio: +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2) };
        })) });
    };
    const capture = async path => {
        await view.evaluate(() => scrollTo(0, 0));
        // Recharts uses a 1500ms entrance animation, restarted on resize/theme.
        await view.waitForTimeout(1700);
        await view.screenshot({ path, fullPage: true });
    };
    const dates = async () => {
        for (const [label, day] of [['Fecha inicial', '01'], ['Fecha final', '28']]) {
            const group = view.getByRole('group', { name: label, exact: true });
            for (const [name, value] of [['Dia', day], ['Mes', '01'], ['Año', '2026']]) {
                const part = group.getByRole('spinbutton', { name, exact: true });
                await part.click(); await part.pressSequentially(value);
            }
            await group.getByRole('spinbutton', { name: 'Año', exact: true }).press('Tab');
        }
    };
    try {
        for (const width of [1440, 390, 320]) {
            await view.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
            await view.goto(base + '/auth/login');
            await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).waitFor();
            await view.waitForFunction(() => getComputedStyle(document.querySelector('.box-shadow')).transform === 'none');
            await noOverflow('login ' + width);
        }
        const email = view.getByLabel('Correo', { exact: true }), password = view.getByLabel('Contraseña', { exact: true });
        await email.fill('demo@example.test'); await password.fill('');
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
        check(await password.getAttribute('aria-invalid') === 'true', 'Password validation missing');
        check(await password.evaluate(e => !!document.getElementById(e.getAttribute('aria-describedby'))?.textContent), 'Password error not associated');
        check(await focused(password), 'Validation focus missing');
        await password.fill('ficticia-p11');
        await view.getByRole('button', { name: 'Mostrar contraseña' }).focus(); await view.keyboard.press('Enter');
        check(await password.getAttribute('type') === 'text', 'Password keyboard toggle');
        await view.getByRole('button', { name: 'Ocultar contraseña' }).click();
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
        await view.getByRole('alert').filter({ hasText: 'No autenticado' }).waitFor();
        await colors('login light', 'a, [role=alert]');
        check(await email.inputValue() === 'demo@example.test' && await password.inputValue() === 'ficticia-p11', 'Login failure loses values');
        await view.screenshot({ path: 'docs/screenshots/p11-login-mobile.png', fullPage: true, mask: [view.locator('input')] });
        loginFailure = false;
        await view.getByRole('button', { name: 'Iniciar sesión', exact: true }).focus(); await view.keyboard.press('Enter');
        await view.getByRole('heading', { name: 'Panel de inicio', exact: true }).waitFor();
        passed.push('Login 1440/390/320: no overflow, validation association/focus, keyboard visibility, live HTTP error, draft and retry');

        await view.setViewportSize({ width: 390, height: 844 });
        const menu = view.getByRole('button', { name: 'Abrir menú', exact: true });
        await menu.focus(); await view.keyboard.press('Enter');
        await view.getByRole('button', { name: 'Drogas', exact: true }).filter({ visible: true }).waitFor();
        await view.keyboard.press('Escape');
        await view.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Abrir menú');
        await view.locator('.MuiDrawer-root.MuiModal-root').waitFor({ state: 'hidden' });
        await menu.click();
        await view.getByRole('button', { name: 'Drogas', exact: true }).filter({ visible: true }).focus(); await view.keyboard.press('Enter');
        await view.getByRole('grid').waitFor();
        check(await view.getByRole('button', { name: 'Panel de inicio', exact: true }).filter({ visible: true }).count() === 0, 'Drawer remains open');
        await noOverflow('drug mobile');
        // DataGrid moves focus and scrolls its own viewport; width alone is not a defect.
        const cell = view.getByRole('gridcell').first();
        await cell.focus(); await view.keyboard.press('ArrowRight');
        check(await view.getByRole('grid').evaluate(e => e.contains(document.activeElement)), 'Grid keyboard focus lost');
        passed.push('Mobile drawer: Enter/Escape/focus return and navigation; table cell keyboard navigation without page overflow');

        for (const size of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
            await view.setViewportSize(size);
            const add = view.getByRole('button', { name: 'Añadir', exact: true });
            await add.focus(); await view.keyboard.press('Enter');
            const dialog = view.getByRole('dialog', { name: 'Crear droga', exact: true });
            await dialog.waitFor();
            check(await dialog.evaluate(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; }), 'Modal clips ' + size.width);
            check(await dialog.evaluate(e => e.contains(document.activeElement)), 'Modal does not receive focus');
            for (let i = 0; i < 6; i++) await view.keyboard.press('Tab');
            check(await dialog.evaluate(e => e.contains(document.activeElement)), 'Modal focus escapes');
            await view.getByRole('button', { name: 'Cancelar', exact: true }).focus(); await view.keyboard.press('Enter');
            await dialog.waitFor({ state: 'detached' });
            check(await focused(add), 'Create modal does not restore trigger');
        }
        await view.getByRole('button', { name: 'Añadir', exact: true }).click();
        await view.getByRole('button', { name: 'Guardar droga' }).click();
        const description = view.getByRole('textbox', { name: 'Descripción', exact: true });
        check(await description.getAttribute('aria-invalid') === 'true', 'Drug validation missing');
        check(await view.getByRole('button', { name: 'Subir imagen de perfil' }).evaluate(e =>
            !!document.getElementById(e.getAttribute('aria-describedby'))?.textContent), 'Photo validation not associated');
        await description.fill('Edición P11');
        await view.locator('input[type=file]').setInputFiles({ name: 'p11.png', mimeType: 'image/png', buffer: png });
        await view.getByRole('button', { name: 'Guardar droga' }).click();
        await view.getByRole('alert').filter({ hasText: 'Error del servidor' }).first().waitFor();
        check(await description.inputValue() === 'Edición P11' && await view.getByRole('img', { name: 'Vista previa 1' }).count() === 1, 'Save error loses fields/file');
        check(writes.at(-1).file, 'Multipart file missing');
        await capture('docs/screenshots/p11-form-mobile.png');
        saveFailure = false;
        await view.getByRole('button', { name: 'Guardar droga' }).click();
        await view.getByRole('dialog').waitFor({ state: 'detached' });
        check(writes.at(-1).file, 'Retry lost file');
        passed.push('Modal desktop/mobile/short 320: fits, traps/restores focus, visible Cancel; validation, failed multipart retains fields/file and retry succeeds');

        await view.setViewportSize({ width: 1440, height: 1000 });
        const remove = view.getByRole('menuitem', { name: 'Borrar', exact: true });
        await remove.focus(); await view.keyboard.press('Enter');
        const confirm = view.getByRole('dialog', { name: 'Borrar droga', exact: true });
        await confirm.waitFor();
        check(await focused(view.getByRole('button', { name: 'Cancelar', exact: true })), 'Confirmation lacks safe initial focus');
        await view.keyboard.press('Escape'); await confirm.waitFor({ state: 'detached' });
        check(await focused(remove), 'Confirmation trigger focus not restored');
        listFailure = true; await view.reload(); await view.getByRole('alert').waitFor();
        listFailure = false; await view.getByRole('button', { name: 'Reintentar listado' }).click(); await view.getByRole('grid').waitFor();
        passed.push('Delete confirmation: labelled, safe initial focus, Escape/restore; list HTTP error and retry');

        await view.goto(base + '/confiscation'); await view.getByRole('grid').waitFor();
        await view.setViewportSize({ width: 320, height: 568 });
        const wideGrid = view.getByRole('grid');
        await wideGrid.getByRole('gridcell').first().focus();
        for (let i = 0; i < 5; i++) await view.keyboard.press('ArrowRight');
        check(await wideGrid.evaluate(e => e.contains(document.activeElement)), 'Wide grid loses keyboard focus');
        const deleteAction = view.getByRole('menuitem', { name: 'Borrar', exact: true });
        await deleteAction.focus();
        check(await deleteAction.evaluate(e => e.getBoundingClientRect().right <= innerWidth), 'Wide grid clips focused action');
        await noOverflow('wide grid');
        await capture('docs/screenshots/p11-table-mobile.png');
        passed.push('Confiscation grid at 320: internal horizontal scrollbar, cells/actions reachable by keyboard without page overflow');

        await view.setViewportSize({ width: 1440, height: 1000 });

        await view.goto(base + '/graph'); await view.locator('form').waitFor();
        await view.getByRole('button', { name: 'Aplicar filtros' }).click();
        check(await view.locator('[aria-invalid=true]').count() > 0, 'Analysis invalid dates accepted');
        await dates();
        await view.getByRole('combobox', { name: 'Drogas', exact: true }).click();
        await view.getByRole('option', { name: 'Ejemplo P11', exact: true }).click(); await view.keyboard.press('Escape');
        await view.getByRole('button', { name: 'Aplicar filtros' }).click();
        await view.getByText('Ver datos del gráfico', { exact: true }).waitFor();
        for (const width of [1440, 390]) {
            await view.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
            for (const type of ['Barra', 'Línea', 'Pastel']) {
                const button = view.getByRole('button', { name: type, exact: true });
                await button.focus(); await view.keyboard.press('Enter');
                check(await button.getAttribute('aria-pressed') === 'true', 'Selected graph type not exposed');
                const summary = view.getByText('Ver datos del gráfico', { exact: true });
                if (!await summary.evaluate(e => e.parentElement.open)) { await summary.focus(); await view.keyboard.press('Enter'); }
                check(await view.getByRole('region', { name: 'Datos del gráfico', exact: true }).innerText().then(t => t.includes('12') && t.includes('8')), 'Chart values unavailable');
                await noOverflow('graph ' + width + ' ' + type);
            }
        }
        await capture('docs/screenshots/p11-graph-mobile.png');
        await colors('graph light', '[aria-pressed=true], summary, .recharts-text');
        await view.getByRole('button', { name: 'Activar tema oscuro' }).click();
        await view.setViewportSize({ width: 1440, height: 1000 });
        await capture('docs/screenshots/p11-graph-dark.png');
        await colors('graph dark', '[aria-pressed=true], summary, label, .recharts-text');
        await view.getByRole('button', { name: 'Barra', exact: true }).click();
        await capture('docs/screenshots/p11-bar-dark.png');
        await colors('bar dark', '.recharts-cartesian-axis-tick-value, .recharts-legend-item-text span');
        await view.getByRole('button', { name: 'Pastel', exact: true }).click();
        graphFailure = true;
        await view.getByRole('button', { name: 'Aplicar filtros' }).click();
        await view.getByRole('alert').filter({ hasText: 'Error del servidor' }).waitFor();
        graphFailure = false; await view.getByRole('button', { name: 'Reintentar', exact: true }).click();
        await view.getByRole('alert').filter({ hasText: 'Error del servidor' }).waitFor({ state: 'detached' });
        passed.push('Graphs desktop/mobile: distinct dates, validation, labelled/pressed controls, bar/line/pie values via keyboard table, dark theme, error/retry retains filters');

        await view.getByRole('button', { name: 'Mapa', exact: true }).filter({ visible: true }).click();
        await view.locator('.leaflet-marker-icon').waitFor();
        for (const width of [1440, 390]) {
            await view.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
            const map = view.getByRole('region', { name: 'Mapa de decomisos', exact: true });
            await map.getByRole('button', { name: 'Acercar', exact: true }).focus(); await view.keyboard.press('Enter');
            await map.getByRole('button', { name: 'Alejar', exact: true }).click();
            const marker = map.getByRole('button', { name: 'Decomiso 7', exact: true });
            await marker.focus(); await view.keyboard.press('Enter');
            await map.locator('.leaflet-popup').waitFor();
            await view.waitForFunction(() => document.activeElement?.textContent === 'Cerrar detalle');
            await view.keyboard.press('Escape');
            await map.locator('.leaflet-popup').waitFor({ state: 'detached' });
            check(await focused(marker), 'Popup does not restore marker focus');
            await noOverflow('map ' + width);
        }
        await capture('docs/screenshots/p11-map-mobile.png');
        passed.push('Map desktop/mobile: labelled region/zoom/marker, keyboard zoom and marker popup/Escape, no overflow; tiles simulated');

        await view.goto(base + '/confiscation/create');
        await view.getByLabel('Observacion', { exact: true }).fill('Borrador P11');
        await view.getByLabel('Dirección', { exact: true }).fill('Dirección P11');
        await view.getByRole('button', { name: 'Seleccionar ubicación en el mapa' }).click();
        check(await focused(view.getByRole('region', { name: 'Mapa para seleccionar ubicación' })), 'Location map initial focus missing');
        await view.locator('.leaflet-container').click({ position: { x: 120, y: 120 } });
        await view.getByRole('alert').filter({ hasText: 'No se pudo obtener la dirección' }).waitFor();
        await view.getByRole('button', { name: 'Volver al formulario' }).click();
        check(await focused(view.getByRole('button', { name: 'Seleccionar ubicación en el mapa' })), 'Location form focus not restored');
        check(await view.getByLabel('Observacion', { exact: true }).inputValue() === 'Borrador P11', 'Geocoding failure loses form');
        await view.getByLabel('Municipalidad', { exact: true }).fill('Manual P11');
        geoFailure = false;
        await view.getByRole('button', { name: 'Seleccionar ubicación en el mapa' }).click();
        await view.locator('.leaflet-container').focus(); await view.keyboard.press('ArrowRight');
        await view.getByRole('button', { name: 'Usar centro del mapa', exact: true }).focus(); await view.keyboard.press('Enter');
        await view.getByRole('status').waitFor({ state: 'detached' });
        await view.getByRole('button', { name: 'Volver al formulario' }).click();
        check(await view.getByLabel('Municipalidad', { exact: true }).inputValue() === 'Municipio P11', 'Geocoding recovery failed');
        await noOverflow('confiscation mobile');
        passed.push('Confiscation form: map receives/restores focus, geocoding failure preserves draft/manual editing, keyboard center selection recovers');
        for (const group of contrast) for (const sample of group.samples) check(sample.ratio >= 4.5, 'Low text contrast ' + group.label + ': ' + JSON.stringify(sample));
        check(!errors.length && !warnings.length, JSON.stringify({ errors, warnings }));
        return { passed, pageErrors: errors, unexpectedConsole: warnings, simulatedWrites: writes.length, contrast };
    } finally { await context.close(); }
}
