// Run manually with Playwright MCP against an authenticated Vite development
// page at http://localhost:5174. Real writes: creates uniquely named fixtures,
// removes only their IDs in finally. Activity/audit records may remain.
async (page) => {
    return page.evaluate(async () => {
        const results = [];
        const cleanup = [];
        const tag = `PORTFOLIO_CHECK_${Date.now()}`;
        const params = { page: 1, per_page: 2, sortBy: 'id', orderType: 'asc', search_by: '', valueSearch: '' };
        const check = (condition, message) => { if (!condition) throw new Error(message); };
        const message = error => error instanceof Error ? error.message : JSON.stringify(error).slice(0,300);
        const run = async (name, fn) => {
            try { results.push({ name, status: 'PASS', ...await fn() }); }
            catch (error) { results.push({ name, status: 'FAIL', error: message(error) }); }
        };
        const load = async (domain, name) => (await import(`/src/modules/${domain}/services/${name}.ts`))[name];
        const png = () => new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='), c => c.charCodeAt(0))], 'portfolio-check.png', { type: 'image/png' });
        const services = {};
        // Respect the local API's 60 requests/minute limit. No retry of writes.
        const { default: api } = await import('/src/api/graphdataApi.ts');
        const pacing = api.interceptors.request.use(async config => {
            await new Promise(resolve => setTimeout(resolve, 1200));
            return config;
        });
        try {
            for (const [domain, name] of [
                ['drug', 'drugService'], ['weapon', 'weaponService'], ['ammunition', 'ammunitionService'],
                ['drugPresentation', 'drugPresentationService'], ['permission', 'permissionService'],
                ['rol', 'roleService'], ['user', 'userService'], ['activity', 'activityService'],
                ['confiscation', 'confiscationService'],
            ]) {
                await run(`list/catalog: ${domain}`, async () => {
                    const service = services[domain] = await load(domain, name);
                    const data = await service.list(params);
                    const rows = data.rows ?? data.permissions;
                    check(Array.isArray(rows) && Number.isInteger(data.tableOptions.total), 'Invalid list contract');
                    if (service.catalog) {
                        const catalog = await service.catalog();
                        check(catalog.length === data.tableOptions.total, 'Incomplete catalog');
                    }
                    return { total: data.tableOptions.total, idType: rows.length ? typeof rows[0].id : null };
                });
            }
            await run('pagination/sorting/filter: drug', async () => {
                const service = services.drug;
                const a = await service.list(params);
                const b = await service.list({ ...params, page: 2 });
                check(b.tableOptions.current_page === 2 && b.rows.every(row => !a.rows.some(first => first.id === row.id)), 'Pages overlap');
                const desc = await service.list({ ...params, orderType: 'desc' });
                check(desc.rows[0].id > desc.rows[1].id, 'Descending order ignored');
                const filtered = await service.list({ ...params, search_by: 'descripcion', valueSearch: a.rows[0].descripcion });
                check(filtered.rows.some(row => row.id === a.rows[0].id), 'Filter lost expected row');
            });
            await run('JSON create/update/detail/delete: confiscation', async () => {
                const service = services.confiscation;
                const values = { fecha: '2026-11-10', observacion: tag, direccion: 'Prueba técnica ficticia', departamento: 'Prueba', municipalidad: 'Prueba', latitud: 14.1, longitud: -87.2 };
                const created = await service.create(values);
                check(created.id !== undefined, 'Missing parent ID');
                cleanup.push({ service, id: created.id, domain: 'confiscation' });
                const stored = await service.detail(created.id);
                check(stored.observacion === tag && Number(stored.latitud) === values.latitud, 'Detail did not persist values');
                await service.update({ ...created, observacion: tag + '_UPDATED' });
                check((await service.detail(created.id)).observacion === tag + '_UPDATED', 'Update did not persist');
                for (const [domain, name, relation, catalog] of [
                    ['drugConfiscation', 'drugConfiscationService', 'droga', 'drug'],
                    ['weaponConfiscation', 'weaponConfiscationService', 'arma', 'weapon'],
                    ['ammunitionConfiscation', 'ammunitionConfiscationService', 'municion', 'ammunition'],
                ]) {
                    await run(`multipart/relations/update/delete: ${domain}`, async () => {
                        const childService = await load(domain, name);
                        const catalogRows = await services[catalog].catalog();
                        check(catalogRows.length > 0, 'No relation fixture available');
                        const input = { cantidad: 1, decomiso: created.id, [relation]: catalogRows[0].id, foto: png() };
                        if (domain === 'drugConfiscation') {
                            input.peso = 1;
                            input.presentacion = (await services.drugPresentation.catalog())[0].id;
                        }
                        const child = await childService.create(input);
                        check(child.identificador !== undefined, 'Missing child ID');
                        cleanup.push({ service: childService, id: child.identificador, domain });
                        check(child.decomiso === created.id && child[relation] === catalogRows[0].id, 'Incorrect relation mapping');
                        check(typeof child.foto === 'string' && child.foto.length > 0, 'No stored image reference');
                        const listed = await childService.list(created.id, params);
                        check(listed.rows.some(row => row.identificador === child.identificador), 'Child not persisted under parent');
                        await run(`pagination metadata: ${domain}`, async () => {
                            check(Number.isInteger(listed.tableOptions.total) && listed.tableOptions.current_page === 1,
                                'Nested endpoint returns rows without total/current_page');
                        });
                        await run(`analysis with persisted fixture: ${domain}`, async () => {
                            const filters = { start_date: '2026-11-01', end_date: '2026-11-30', drugs: [], weapons: [], ammunitions: [] };
                            const [field, type] = { drug: ['drugs', 'Drogas'], weapon: ['weapons', 'Armas'], ammunition: ['ammunitions', 'Municiones'] }[catalog];
                            filters[field] = [catalogRows[0].id];
                            const { getGraphData } = await import('/src/modules/graph/services/graphService.ts');
                            const graph = await getGraphData({ filters, period: 1, typeConfiscation: type, typeGraph: 'bar' });
                            check(graph.lineBarData.length > 0, 'Graph did not include persisted fixture');
                            const { getMapItems } = await import('/src/modules/map/services/mapService.ts');
                            const points = await getMapItems(filters);
                            check(points.some(point => point.id === created.id), 'Map did not include persisted fixture');
                        });
                        await childService.update({ ...child, cantidad: 2 });
                        const updated = (await childService.list(created.id, params)).rows.find(row => row.identificador === child.identificador);
                        check(Number(updated?.cantidad) === 2 && updated.foto === child.foto, 'Update/image preservation failed');
                        await childService.remove(child.identificador);
                        cleanup.pop();
                        const empty = await childService.list(created.id, params);
                        check(!empty.rows.some(row => row.identificador === child.identificador), 'Child not deleted');
                        await run(`empty pagination metadata: ${domain}`, async () => {
                            check(empty.tableOptions.total === 0 && empty.tableOptions.current_page === 1,
                                'Empty nested endpoint omits pagination metadata');
                        });
                    });
                }
                // All children must have been removed before deleting this parent.
                check(cleanup.length === 1, 'Child cleanup pending');
                await service.remove(created.id);
                cleanup.pop();
                let missing = false;
                try { await service.detail(created.id); } catch { missing = true; }
                check(missing, 'Deleted detail still readable');
            });
            for (const type of ['Drogas', 'Armas', 'Municiones']) {
                await run(`analysis graph: ${type}`, async () => {
                    const { getGraphData } = await import('/src/modules/graph/services/graphService.ts');
                    const data = await getGraphData({ filters: { start_date: '2025-01-01', end_date: '2026-12-31', drugs: [], weapons: [], ammunitions: [] }, period: 1, typeConfiscation: type, typeGraph: 'bar' });
                    check(Array.isArray(data.lineBarData) && Array.isArray(data.pieData), 'Invalid graph contract');
                    return { points: data.lineBarData.length };
                });
            }
            await run('analysis map', async () => {
                const { getMapItems } = await import('/src/modules/map/services/mapService.ts');
                const items = await getMapItems({ start_date: '2025-01-01', end_date: '2026-12-31', drugs: [], weapons: [], ammunitions: [] });
                check(Array.isArray(items), 'Invalid map contract');
                return { points: items.length };
            });
        } finally {
            for (const item of cleanup.reverse()) {
                await run(`cleanup: ${item.domain}`, async () => { await item.service.remove(item.id); });
            }
            api.interceptors.request.eject(pacing);
        }
        return { tag, results };
    });
}
