// Manual P01 audit with Playwright MCP and real local API; no interceptions.
// Requires an administrative session. Never provisions the persistent catalog
// or changes existing users. Creates tagged fixtures and cleans their IDs in finally.
async (page) => {
    const tag = `PORTFOLIO_RBAC_P01_${Date.now()}`;
    const results = [];
    const cleanup = [];
    const report = { tag, results, cleanup, status: 'running' };
    // MCP calls time out after 300s. Select at most three profiles per call via
    // window.__P01AuditProfiles; each batch owns and cleans its own fixtures.
    const profiles = await page.evaluate(() => window.__P01AuditProfiles ?? ['sin_sesion', 'sin_rol', 'analista']);
    if (!Array.isArray(profiles) || profiles.length < 1 || profiles.length > 3 ||
        new Set(profiles).size !== profiles.length || profiles.some(profile =>
            !['sin_sesion', 'sin_rol', 'analista', 'operador', 'administrador', 'permiso_directo'].includes(profile))) {
        throw new Error('Select one to three distinct P01 profiles');
    }
    report.profiles = profiles;
    const domains = ['user', 'role', 'permission', 'drug', 'drugPresentation', 'weapon', 'ammunition', 'confiscation',
        'drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation'];
    const required = [...domains.flatMap(domain => ['view', 'create', 'update', 'delete'].map(action => `${domain}.${action}`)),
        'dashboard.view', 'graph.view', 'map.view', 'activity.view'];
    let lastRequest = 0;
    const request = async (context, method, path, data, multipart = false) => {
        await new Promise(resolve => setTimeout(resolve, Math.max(0, 1250 - (Date.now() - lastRequest))));
        lastRequest = Date.now();
        const response = await context.request.fetch('http://localhost/api/' + path, {
            method, headers: { Accept: 'application/json' }, maxRetries: 0, maxRedirects: 0, timeout: 15000,
            ...(data === undefined ? {} : multipart ? { multipart: data } : { data }),
        });
        const status = response.status();
        let body;
        try { body = await response.json(); } catch { body = null; }
        await response.dispose();
        if (status === 429) throw new Error('Rate limit 429; no automatic retry');
        return { status, body };
    };
    const ok = response => response.status >= 200 && response.status < 300;
    const check = (profile, action, domain, expected, response, extra = {}) => {
        const result = { profile, action, domain, expected, actual: response.status,
            pass: expected === '2xx' ? ok(response) : response.status === expected, ...extra };
        if (!ok(response)) result.error = { code: response.body?.code,
            message: typeof response.body?.error === 'string' ? response.body.error : response.body?.message };
        results.push(result);
        return result;
    };
    const requireSuccess = (response, label) => {
        if (!ok(response)) throw new Error(`${label}: HTTP ${response.status}`);
        return response.body;
    };
    const own = (domain, body) => {
        const id = body?.identificador;
        if (!['number', 'string'].includes(typeof id) || String(id).length === 0) {
            throw new Error(`Missing ${domain} fixture ID; inspect server audit before rerunning`);
        }
        const item = { domain, id, removed: false };
        cleanup.push(item);
        return item;
    };
    const create = async (domain, values, multipart = false) => own(domain,
        requireSuccess(await request(page.context(), 'POST', domain, values, multipart), `setup ${domain}`));
    const names = (items, catalog = []) => (items ?? []).map(item => {
        if (typeof item === 'object' && item !== null) return item.nombre ?? item.name ??
            catalog.find(row => String(row.identificador) === String(item.identificador ?? item.id))?.nombre;
        return typeof item === 'string' && !/^\d+$/.test(item) ? item :
            catalog.find(row => String(row.identificador) === String(item))?.nombre;
    }).sort();
    const same = (a, b) => !a.includes(undefined) && !b.includes(undefined) && JSON.stringify(a) === JSON.stringify(b);
    const list = domain => `${domain}?page=1&per_page=100&sort_by=identificador&type=asc&=`;
    const catalog = async domain => {
        const rows = [];
        let total;
        let lastPage;
        for (let index = 1; ; index++) {
            const body = requireSuccess(await request(page.context(), 'GET', list(domain).replace('page=1&', `page=${index}&`)), `catalog ${domain}`);
            if (!Array.isArray(body.data) || body.current_page !== index || !Number.isInteger(body.total) ||
                !Number.isInteger(body.last_page) || body.last_page < index ||
                (total !== undefined && (body.total !== total || body.last_page !== lastPage))) {
                throw new Error(`Unverified catalog pagination: ${domain}`);
            }
            total = body.total;
            lastPage = body.last_page;
            rows.push(...body.data);
            if (index === lastPage) break;
        }
        if (rows.length !== total || new Set(rows.map(row => row.identificador)).size !== total) throw new Error(`Incomplete catalog: ${domain}`);
        return rows;
    };
    const analysis = [['drugGraphIndex', 'graph.view'], ['weaponGraphIndex', 'graph.view'],
        ['ammunitionGraphIndex', 'graph.view'], ['confiscation/map', 'map.view']];
    const analysisPath = endpoint => `${endpoint}?period=month&start_date=2026-11-01&end_date=2026-11-30&typeGraph=bar&drugs=[]&weapons=[]&ammunitions=[]`;
    try {
        const session = await request(page.context(), 'POST', 'refresh');
        check('setup', 'refresh', 'session', 200, session);
        const effective = names(session.body?.permissions);
        report.preflight = { roles: names(session.body?.roles), permissionCount: effective.length,
            missingPermissions: required.filter(name => !effective.includes(name)) };
        if (!ok(session) || report.preflight.missingPermissions.length) {
            // Read-only diagnosis. No privileged mutation without setup/cleanup rights.
            for (const profile of ['sin_sesion', 'sesion_disponible']) {
                const context = profile === 'sin_sesion' ? await page.context().browser().newContext() : page.context();
                try {
                    for (const domain of [...domains.filter(domain => !domain.endsWith('Confiscation')), 'activity']) {
                        check(profile, 'list', domain, profile === 'sin_sesion' ? 401 : effective.includes(`${domain}.view`) ? 200 : 403,
                            await request(context, 'GET', list(domain)));
                    }
                    for (const [endpoint, permission] of analysis) check(profile, 'analysis', endpoint,
                        profile === 'sin_sesion' ? 401 : effective.includes(permission) ? 200 : 403,
                        await request(context, 'GET', analysisPath(endpoint)));
                } finally { if (context !== page.context()) await context.close(); }
            }
            report.status = 'blocked_administrative_session';
        } else {
            const permissions = await catalog('permission');
            const roles = await catalog('role');
            const permissionId = name => {
                const matches = permissions.filter(item => item.nombre === name);
                if (matches.length !== 1) throw new Error(`Missing/ambiguous permission: ${name}`);
                return matches[0].identificador;
            };
            for (const name of required) permissionId(name);
            for (const name of ['analista', 'operador', 'administrador']) {
                if (roles.filter(item => item.nombre === name).length !== 1) throw new Error(`Missing/ambiguous role: ${name}`);
            }
            const password = await page.evaluate(() => `Audit!${crypto.randomUUID()}`);
            const account = { nombre: tag, correo: `${tag.toLowerCase()}@example.test`, password, roles: [], permisos: [] };
            const user = await create('user', account);
            const parentValues = { fecha: '2026-11-10', observacion: tag, direccion: 'Prueba ficticia',
                departamento: 'Prueba', municipalidad: 'Prueba', latitud: 14.1, longitud: -87.2 };
            const parent = await create('confiscation', parentValues);
            const png = () => ({ name: 'p01.png', mimeType: 'image/png',
                buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
            const drug = await create('drug', { descripcion: tag, logo: png() }, true);
            const presentation = await create('drugPresentation', { descripcion: tag, logo: png() }, true);
            const childValues = { decomiso: String(parent.id), droga: String(drug.id), presentacion: String(presentation.id), cantidad: '1', peso: '1' };
            // Representative JSON, multipart override and nested-relation writes.
            // This does not claim exhaustive CRUD coverage of all controllers.
            const definitions = [
                { domain: 'permission', values: suffix => ({ nombre: `${tag}_${suffix}` }) },
                { domain: 'confiscation', values: suffix => ({ ...parentValues, observacion: `${tag}_${suffix}` }) },
                { domain: 'drug', multipart: true, values: suffix => ({ descripcion: `${tag}_${suffix}`, logo: png() }) },
                { domain: 'drugConfiscation', multipart: true, values: () => ({ ...childValues, foto: png() }) },
            ];
            report.roleCatalog = roles.filter(role => ['administrador', 'operador', 'analista'].includes(role.nombre))
                .map(role => ({ name: role.nombre, permissions: names(role.permisos, permissions) }));
            for (const profile of profiles) {
                const role = roles.find(item => item.nombre === profile);
                const direct = profile === 'permiso_directo' ? [permissionId('drug.view')] : [];
                const expected = role ? names(role.permisos, permissions) : profile === 'permiso_directo' ? ['drug.view'] : [];
                if (expected.includes(undefined)) throw new Error(`Unresolved role relations: ${profile}`);
                if (profile !== 'sin_sesion') requireSuccess(await request(page.context(), 'PUT', `user/${user.id}`,
                    { ...account, roles: role ? [role.identificador] : [], permisos: direct }), 'assign temporary user');
                const context = await page.context().browser().newContext();
                try {
                    if (profile !== 'sin_sesion') {
                        for (const action of ['login', 'refresh']) {
                            const response = await request(context, 'POST', action, action === 'login' ? { email: account.correo, password } : undefined);
                            const result = check(profile, action, 'session', 200, response);
                            result.permissionsMatch = same(names(response.body?.permissions, permissions), expected);
                            result.rolesMatch = same(names(response.body?.roles, roles), role ? [profile] : []);
                            result.pass &&= result.permissionsMatch && result.rolesMatch;
                            requireSuccess(response, `temporary ${action}`);
                        }
                    }
                    const expectedStatus = permission => profile === 'sin_sesion' ? 401 : expected.includes(permission) ? '2xx' : 403;
                    for (const domain of [...domains, 'activity']) {
                        const path = domain.endsWith('Confiscation') ? `${domain}/${parent.id}/confiscation?page=1&per_page=2` : list(domain);
                        check(profile, 'list', domain, expectedStatus(`${domain}.view`), await request(context, 'GET', path));
                    }
                    check(profile, 'detail', 'confiscation', expectedStatus('confiscation.view'),
                        await request(context, 'GET', `confiscation/${parent.id}`));
                    for (const [endpoint, permission] of analysis) check(profile, 'analysis', endpoint,
                        expectedStatus(permission), await request(context, 'GET', analysisPath(endpoint)));
                    for (const definition of definitions) {
                        const { domain, multipart = false } = definition;
                        const values = definition.values(`${profile}_create`);
                        const created = await request(context, 'POST', domain, values, multipart);
                        check(profile, 'create', domain, expectedStatus(`${domain}.create`), created);
                        if (ok(created)) own(domain, created.body);
                        // Independent admin target: denied create/read never prevents update/delete checks.
                        const targetValues = definition.values(`${profile}_target`);
                        const target = await create(domain, targetValues, multipart);
                        const updatedValues = domain === 'permission' ? { nombre: `${tag}_${profile}_updated` } :
                            domain === 'confiscation' ? { ...targetValues, observacion: `${tag}_${profile}_updated` } :
                                domain === 'drug' ? { descripcion: `${tag}_${profile}_updated` } : { ...childValues, cantidad: '2' };
                        const updated = await request(context, multipart ? 'POST' : 'PUT', `${domain}/${target.id}`,
                            multipart ? { ...updatedValues, _method: 'PUT' } : updatedValues, multipart);
                        const updateResult = check(profile, 'update', domain, expectedStatus(`${domain}.update`), updated,
                            { transport: multipart ? 'multipart POST _method=PUT' : 'JSON PUT' });
                        if (ok(updated) && domain === 'drugConfiscation') {
                            updateResult.relationsMatch = ['decomiso', 'droga', 'presentacion'].every(key =>
                                String(updated.body?.[key]?.identificador) === childValues[key]);
                            updateResult.pass &&= updateResult.relationsMatch && Number(updated.body?.cantidad) === 2;
                        }
                        const removed = await request(context, 'DELETE', `${domain}/${target.id}`);
                        check(profile, 'delete', domain, expectedStatus(`${domain}.delete`), removed);
                        if (ok(removed)) target.removed = true;
                    }
                } finally {
                    await context.close();
                    await page.evaluate(value => { window.__P01AuditReport = value; }, report);
                }
            }
            report.status = results.every(item => item.pass) ? 'passed' : 'failed';
        }
    } catch (error) {
        report.status = 'blocked_contract_or_setup';
        report.error = error instanceof Error ? error.message : 'Unknown audit error';
    } finally {
        // Delete children before parents/catalogs; never use bulk/prefix deletion.
        for (const domain of ['drugConfiscation', 'confiscation', 'drugPresentation', 'drug', 'permission', 'user']) {
            for (const item of cleanup.filter(item => item.domain === domain && !item.removed).reverse()) {
                try {
                    const response = await request(page.context(), 'DELETE', `${item.domain}/${item.id}`);
                    item.cleanupStatus = response.status;
                    item.removed = ok(response);
                } catch { item.cleanupError = 'Transport/throttling failure; no retry'; }
            }
        }
        if (cleanup.some(item => !item.removed)) report.status = 'cleanup_incomplete';
        report.counts = { checks: results.length, passed: results.filter(item => item.pass).length,
            failed: results.filter(item => !item.pass).length, fixtures: cleanup.length,
            remainingFixtures: cleanup.filter(item => !item.removed).length };
        // Sanitized recovery checkpoint; never includes credentials/session bodies.
        await page.evaluate(value => { window.__P01AuditReport = value; }, report);
    }
    return report;
}
