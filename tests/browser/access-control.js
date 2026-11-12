// P04: isolated HTTP simulation. No requests or writes reach the real backend.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(12000);
    const passed = [], errors = [], warnings = [], reads = [], writes = [];
    let permissions = [], roles = [], refreshes = 0, logouts = 0;
    const check = (value, message) => { if (!value) throw new Error(message); };
    const catalogs = ['drug', 'drugPresentation', 'weapon', 'ammunition'];
    const records = ['confiscation', 'drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation'];
    const analysis = ['dashboard', 'graph', 'map'];
    const analyst = [...catalogs, ...records, ...analysis].map(domain => domain + '.view');
    const operator = [...analyst, ...[...catalogs, ...records].flatMap(domain => ['create', 'update'].map(action => domain + '.' + action))];
    const admin = [...catalogs, ...records, 'user', 'role', 'permission'].flatMap(domain => (['dashboard', 'graph', 'map', 'activity'].includes(domain) ? ['view'] : ['view', 'create', 'update', 'delete']).map(action => domain + '.' + action)).concat(analysis.map(domain => domain + '.view'), 'activity.view');
    const parent = { identificador: 7, fecha: '2026-11-08', observacion: 'P04 parent', direccion: 'Fixture', departamento: 'Fixture', municipalidad: 'Fixture', latitud: 1, longitud: 2 };
    view.on('pageerror', error => errors.push(error.message));
    view.on('console', msg => {
        if (['warning', 'error'].includes(msg.type()) && !/Failed to load resource:|Canvas2D:|out-of-range value `0`/.test(msg.text())) warnings.push(msg.text().slice(0, 240));
    });
    await context.route('**/*', async route => {
        const req = route.request();
        if (req.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
        if (!['xhr', 'fetch'].includes(req.resourceType())) return route.fallback();
        const url = new URL(req.url()), path = url.pathname.replace(/^\/api\//, '');
        if (path === 'refresh') { refreshes++; return route.fulfill({ json: { user: { name: 'P04 fixture', email: 'fixture@example.test' }, permissions, roles } }); }
        if (path === 'logout') { logouts++; return route.fulfill({ json: {} }); }
        if (req.method() !== 'GET') {
            writes.push(path);
            return route.fulfill({ status: 403, json: { error: 'User does not have the right permissions.', code: 403 } });
        }
        reads.push(path);
        if (path === 'confiscation/7') return route.fulfill({ json: parent });
        const domain = path.split('/')[0];
        let data = [];
        if (catalogs.includes(domain)) data = [{ identificador: 7, descripcion: 'P04 catalog', logo: '' }];
        if (domain === 'confiscation') data = [parent];
        if (domain === 'drugConfiscation') data = [{ identificador: 8, decomiso: { identificador: 7 }, droga: { identificador: 7, descripcion: 'P04 drug' }, presentacion: { identificador: 7, descripcion: 'P04 presentation' }, cantidad: 2, peso: 1, foto: '' }];
        if (domain === 'weaponConfiscation') data = [{ identificador: 9, decomiso: { identificador: 7 }, arma: { identificador: 7, descripcion: 'P04 weapon' }, cantidad: 2, foto: '' }];
        if (domain === 'ammunitionConfiscation') data = [{ identificador: 10, decomiso: { identificador: 7 }, municion: { identificador: 7, descripcion: 'P04 ammunition' }, cantidad: 2, foto: '' }];
        if (domain === 'user') data = [{ identificador: 7, nombre: 'P04 user', correo: 'fixture@example.test', permisos: [], roles: [] }];
        if (['role', 'permission'].includes(domain)) data = [{ identificador: 7, nombre: 'P04 option', permisos: [] }];
        return route.fulfill({ json: { data, total: data.length, current_page: 1, last_page: 1, per_page: 100 } });
    });
    const go = async (path, grants, roleNames = []) => {
        permissions = grants; roles = roleNames; reads.length = 0;
        await view.goto('http://127.0.0.1:5174' + path);
    };
    const deny = async (path, grants = [], roleNames = []) => {
        await go(path, grants, roleNames);
        await view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
        check(reads.length === 0, path + ' made unauthorized reads: ' + reads.join(','));
        check(await view.getByRole('button', { name: 'Cerrar sesión' }).count() === 1, 'Missing logout');
    };
    try {
        for (const path of ['/user', '/rol', '/permiso', '/actividad', '/drug', '/weapon', '/ammunition', '/drugPresentation', '/confiscation', '/confiscation/create', '/confiscation/edit/7', '/confiscation/detail/7', '/dashboard', '/map', '/graph']) await deny(path);
        await deny('/user', [], ['administrador']);
        passed.push('15 direct routes denied without HTTP; role name alone grants nothing; logout available');

        await go('/', ['drug.view']);
        await view.waitForURL('**/drug');
        await view.getByRole('row').filter({ hasText: 'P04 catalog' }).waitFor();
        check(await view.getByRole('button', { name: 'add', exact: true }).count() === 0, 'Direct view can create');
        check(await view.getByRole('menuitem', { name: /Edit|Delete/ }).count() === 0, 'Direct view has CRUD');
        check(await view.getByRole('button', { name: /Users|Roles|Graphs|Map|Confiscations/, exact: true }).count() === 0, 'Menu leaked destination');
        await deny('/dashboard', ['drug.view']);
        passed.push('Direct permission opens allowed landing/list only and filters menu/actions');

        await go('/user', ['user.view', 'user.create', 'user.update']);
        await view.getByRole('row').filter({ hasText: 'P04 user' }).waitFor();
        check(reads.join(',') === 'user', 'User list fetched unauthorized catalogs');
        check(await view.getByRole('button', { name: 'add', exact: true }).count() === 0, 'Form without catalogs available');
        for (const path of ['/map', '/graph', '/dashboard']) await deny(path, [path.slice(1) + '.view']);
        await deny('/confiscation/create', ['confiscation.create']);
        await deny('/confiscation/edit/7', ['confiscation.view']);
        passed.push('Missing view/catalog dependencies block forms, composed dashboard and analysis before HTTP');

        for (const [name, grants] of [['analista', analyst], ['operador', operator], ['administrador', admin]]) {
            await go('/drug', grants, [name]);
            await view.getByRole('row').filter({ hasText: 'P04 catalog' }).waitFor();
            check(await view.getByRole('button', { name: 'add', exact: true }).count() === (name === 'analista' ? 0 : 1), name + ': catalog create');
            check(await view.getByRole('menuitem', { name: 'Delete', exact: true }).count() === (name === 'administrador' ? 1 : 0), name + ': catalog delete');
            await go('/confiscation/detail/7', grants, [name]);
            await view.getByText('Detalle de decomiso', { exact: true }).waitFor();
            await view.getByText('P04 drug', { exact: true }).waitFor();
            check(reads.filter(path => /Confiscation\//.test(path)).length === 3, name + ': missing children');
            check(!reads.some(path => catalogs.includes(path)), name + ': prefetched catalogs without open form');
            check(await view.getByRole('button', { name: 'Añadir subdecomiso', includeHidden: true }).count() === (name === 'analista' ? 0 : 3), name + ': child create');
            check(await view.getByRole('button', { name: 'Borrar subdecomiso', includeHidden: true }).count() === (name === 'administrador' ? 3 : 0), name + ': child delete');
        }
        await view.screenshot({ path: '.playwright-mcp/p04-detail.png', fullPage: true });
        passed.push('Three complete profiles: catalog CRUD, read-only parent detail and all child types');

        await go('/confiscation/detail/7', ['confiscation.view', 'drugConfiscation.view', 'drugConfiscation.delete']);
        await view.getByText('P04 drug', { exact: true }).waitFor();
        check(reads.length === 2 && reads.includes('drugConfiscation/7/confiscation'), 'Partial child permissions leak reads');
        check(await view.getByRole('button', { name: 'Añadir subdecomiso' }).count() === 0, 'Partial user can create');
        await view.getByRole('button', { name: 'Borrar subdecomiso' }).click();
        await view.getByRole('button', { name: 'Ok', exact: true }).click();
        await view.getByRole('dialog').getByRole('alert').waitFor();
        check(reads.length === 2, 'Failed write invalidated reads');
        check(writes.at(-1) === 'drugConfiscation/8', 'Delete-only action unavailable');
        passed.push('Partial child view/delete works without catalogs/update; backend 403 preserves confirmation');

        for (const path of ['/dashboard', '/graph', '/map']) {
            await go(path, analyst, ['analista']);
            if (path === '/dashboard') await view.getByRole('row').filter({ hasText: 'P04 catalog' }).waitFor();
            else await view.getByRole('combobox').first().waitFor();
            check(reads.length === (path === '/dashboard' ? 1 : 3), path + ': unexpected dependencies ' + reads);
        }
        passed.push('Authorized dashboard and analysis mount with their expected catalog reads');

        await deny('/drug');
        await view.screenshot({ path: '.playwright-mcp/p04-denied.png', fullPage: true });
        await view.getByRole('button', { name: 'Cerrar sesión' }).focus();
        check(await view.getByRole('button', { name: 'Cerrar sesión' }).evaluate(el => el === document.activeElement), 'Logout not keyboard reachable');
        await view.keyboard.press('Enter');
        await view.waitForURL('**/auth/login');
        check(logouts === 1, 'Logout failed');
        check(errors.length === 0, errors.join('; '));
        check(warnings.length === 0, warnings.join('; '));
        passed.push('No-permission session exits by keyboard; no page exceptions or unexpected console warnings');
        return { passed, pageErrors: errors, unexpectedConsole: warnings, simulatedWrites: writes.length, refreshes, logouts };
    } finally { await context.close(); }
}
