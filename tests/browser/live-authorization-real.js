// P05: real API, administrative page session, own temporary user/role/permissions.
// Delays only delivery of real server responses for the pending-work scenarios.
async (page) => {
    const context = await page.context().browser().newContext();
    const view = await context.newPage();
    view.setDefaultTimeout(12000);
    await view.clock.install();
    const tag = `PORTFOLIO_P05_${Date.now()}`;
    const report = { tag, passed: [], responses: [], cleanup: [], pageErrors: [], status: 'running' };
    const fixtures = [];
    let last = 0, releaseRead, releaseWrite;
    const check = (value, message) => { if (!value) throw new Error(message); };
    const request = async (ctx, method, path, data) => {
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1250 - (Date.now() - last))));
        last = Date.now();
        const response = await ctx.request.fetch('http://localhost/api/' + path, {
            method, data, headers: { Accept: 'application/json' }, timeout: 15000, maxRetries: 0 });
        let body; try { body = await response.json(); } catch { body = null; }
        const status = response.status(); await response.dispose();
        if (status === 429) throw new Error('429: no automatic retry');
        return { status, body };
    };
    const ok = (response, label) => { check(response.status === 200, label + ': HTTP ' + response.status); return response.body; };
    const record = (operation, result) => report.responses.push({ operation, status: result.status,
        ...(result.status >= 400 ? { body: result.body } : { roles: result.body?.roles, permissions: result.body?.permissions }) });
    const create = async (domain, data) => {
        const result = ok(await request(page.context(), 'POST', domain, data), 'create ' + domain);
        check(Number.isSafeInteger(result.identificador), 'Missing fixture ID: ' + domain);
        fixtures.push({ domain, id: result.identificador }); return result.identificador;
    };
    view.on('pageerror', error => report.pageErrors.push(error.message));
    const manual = () => view.getByRole('button', { name: 'Actualizar permisos', exact: true }).click();
    const poll = () => view.clock.fastForward(61000);
    const denied = () => view.getByRole('alert', { name: 'Acceso denegado' }).waitFor();
    let account, userId, roleId, rolePermissions, direct;
    const assign = async (roles, permisos) => ok(await request(page.context(), 'PUT', `user/${userId}`,
        { ...account, roles, permisos }), 'assign temporary account');
    const updateRole = async permisos => ok(await request(page.context(), 'PUT', `role/${roleId}`,
        { nombre: tag, permisos }), 'update own temporary role');
    const session = async label => {
        const result = await request(context, 'POST', 'refresh'); record(label, result); return ok(result, label);
    };
    try {
        const admin = ok(await request(page.context(), 'POST', 'refresh'), 'Administrative session');
        check(['user.create', 'user.update', 'user.delete', 'role.create', 'role.update', 'role.delete',
            'permission.create', 'permission.delete'].every(p => admin.permissions.includes(p)), 'Insufficient fixture rights');
        const catalog = ok(await request(page.context(), 'GET', 'permission?page=1&per_page=100&sort_by=identificador&type=asc'), 'Permission catalog');
        check(catalog.current_page === 1 && catalog.last_page === 1 && catalog.data.length === catalog.total, 'Incomplete catalog');
        const id = name => { const rows = catalog.data.filter(row => row.nombre === name);
            check(rows.length === 1, 'Ambiguous permission: ' + name); return rows[0].identificador; };
        rolePermissions = ['drug.view'].map(id);
        direct = ['permission.view', 'permission.create', 'permission.update'].map(id);
        roleId = await create('role', { nombre: tag, permisos: rolePermissions });
        const password = 'Audit!' + await page.evaluate(() => crypto.randomUUID());
        account = { nombre: tag, correo: tag.toLowerCase() + '@example.test', password };
        userId = await create('user', { ...account, roles: [roleId], permisos: direct });
        const logged = await request(context, 'POST', 'login', { email: account.correo, password });
        record('temporary login', logged); ok(logged, 'temporary login');
        await view.goto('http://localhost:5174/drug'); await view.getByRole('grid').waitFor();
        check(await view.getByRole('button', { name: 'add', exact: true }).count() === 0, 'View role acquired create');
        await updateRole([]); // user is idle on /drug, with its session cookie unchanged
        const revoked = await session('role permission revoked in open session');
        check(!revoked.permissions.includes('drug.view') && revoked.roles.includes(tag), 'Refresh kept revoked role permission');
        const read403 = await request(context, 'GET', 'drug'); record('read after role permission revocation', read403);
        check(read403.status === 403, 'Operation ignored role revocation');
        await poll(); await denied();
        check(await view.getByRole('grid').count() === 0, 'Idle view kept grid');
        report.passed.push('Own role permission revocation: refresh and operation enforce it; idle poll withdraws view');

        await updateRole(rolePermissions); await manual(); await view.getByRole('grid').waitFor();
        await assign([], direct); await poll(); await denied();
        const noRole = await session('role unassigned in open session');
        check(noRole.roles.length === 0 && !noRole.permissions.includes('drug.view'), 'Role removal ignored');
        await assign([roleId], direct); await manual(); await view.getByRole('grid').waitFor();
        report.passed.push('Role restoration, unassignment and reassignment recover the same open account');

        await view.getByRole('button', { name: 'Permission', exact: true }).click();
        await view.waitForURL('**/permiso'); await view.getByRole('grid').waitFor();
        await view.getByRole('button', { name: 'add', exact: true }).click();
        const form = view.getByRole('dialog', { name: 'Crear permiso' });
        await form.getByLabel('Nombre', { exact: true }).fill(tag + '_draft');
        await poll();
        check(await form.getByLabel('Nombre', { exact: true }).inputValue() === tag + '_draft', 'Unchanged refresh lost editing');
        await assign([roleId], [id('permission.view')]); await poll();
        await form.waitFor({ state: 'detached' }); await view.getByRole('grid').waitFor();
        check(await view.getByRole('button', { name: 'add', exact: true }).count() === 0, 'Revoked form action remained');
        const write403 = await request(context, 'POST', 'permission', { nombre: tag + '_denied' });
        record('write after direct create revocation', write403); check(write403.status === 403, 'Direct write revocation ignored');
        report.passed.push('Unchanged refresh keeps editing; direct create/update revocation discards form and write is 403');

        // Real read accepted before revocation; hold only its delivery to the SPA.
        let readStarted;
        const reading = new Promise(resolve => { readStarted = resolve; });
        await context.route('**/api/permission?**', async route => {
            const response = await route.fetch(); const body = await response.body();
            report.responses.push({ operation: 'held real read before revocation', status: response.status() });
            readStarted(); await new Promise(resolve => { releaseRead = resolve; });
            await route.fulfill({ response, body }).catch(() => {}); await response.dispose();
        });
        await view.getByRole('columnheader', { name: 'Nombre', exact: true }).click(); await reading;
        await assign([roleId], []); await manual(); await denied();
        releaseRead(); releaseRead = undefined; await context.unroute('**/api/permission?**');
        check(await view.getByRole('grid').count() === 0, 'Late real read restored grid');
        report.passed.push('Pending real read: accepted response is retired after direct view revocation');

        await assign([roleId], direct); await manual(); await view.getByRole('grid').waitFor();
        let writeStarted;
        const writing = new Promise(resolve => { writeStarted = resolve; });
        await context.route('**/api/permission', async route => {
            if (route.request().method() !== 'POST') return route.fallback();
            const response = await route.fetch(); const body = await response.body();
            const result = JSON.parse(body.toString());
            report.responses.push({ operation: 'server accepted held write', status: response.status() });
            if (response.status() === 200 && Number.isSafeInteger(result.identificador)) fixtures.push({ domain: 'permission', id: result.identificador });
            writeStarted(); await new Promise(resolve => { releaseWrite = resolve; });
            await route.fulfill({ response, body }).catch(() => {}); await response.dispose();
        });
        await view.getByRole('button', { name: 'add', exact: true }).click();
        const writeForm = view.getByRole('dialog', { name: 'Crear permiso' });
        await writeForm.getByLabel('Nombre', { exact: true }).fill(tag + '_accepted');
        await writeForm.getByRole('button', { name: 'Guardar permiso' }).click(); await writing;
        await assign([roleId], []); await poll(); await denied();
        releaseWrite(); releaseWrite = undefined; await context.unroute('**/api/permission');
        check(await view.getByRole('grid').count() === 0 && await view.getByRole('dialog').count() === 0, 'Late write effects leaked');
        const committed = fixtures.find(item => item.domain === 'permission');
        check(committed, 'Server did not accept held write');
        // Backend list proves persistence independently of transport cancellation.
        const persisted = ok(await request(page.context(), 'GET', 'permission?page=1&per_page=100&sort_by=identificador&type=asc'), 'verify committed write');
        check(persisted.data.some(row => row.identificador === committed.id && row.nombre === tag + '_accepted'), 'Accepted write missing on server');
        report.passed.push('Pending real write committed on Laravel; cancellation suppresses client success, without undoing server data');

        await assign([roleId], direct); await manual(); await view.getByRole('grid').waitFor();
        const restored = await session('direct permissions reassigned');
        check(['permission.view', 'permission.create', 'permission.update'].every(p => restored.permissions.includes(p)), 'Direct assignment missing');
        await view.getByRole('button', { name: 'Cerrar sesión', exact: true }).click(); await view.waitForURL('**/auth/login');
        const afterLogout = await request(context, 'POST', 'refresh'); record('refresh after real logout', afterLogout);
        check(afterLogout.status === 401, 'Unexpected logout result');
        check(report.pageErrors.length === 0, report.pageErrors.join('; '));
        report.passed.push('Direct permissions recover without new login; real logout returns to login');
        report.status = 'passed';
    } catch (error) { report.status = 'failed'; report.error = error.message; }
    finally {
        releaseRead?.(); releaseWrite?.(); await context.close();
        // Delete the account before its role; only records owned by this run.
        const order = [...fixtures.filter(x => x.domain === 'user'), ...fixtures.filter(x => x.domain === 'role'), ...fixtures.filter(x => x.domain === 'permission')];
        for (const fixture of order) {
            const result = await request(page.context(), 'DELETE', `${fixture.domain}/${fixture.id}`);
            report.cleanup.push({ ...fixture, status: result.status, removed: result.status === 200 });
        }
    }
    return report;
}
