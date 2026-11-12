// P06: authenticated localhost:5174 page; real API, only own fixtures removed.
async (page) => {
    return page.evaluate(async () => {
        const { default: api } = await import('/src/api/graphdataApi.ts');
        const { confiscationService: parents } = await import('/src/modules/confiscation/services/confiscationService.ts');
        const report = { cases: [], cleanup: [], failures: [] };
        const fixtures = [];
        const tag = `PORTFOLIO_P06_${Date.now()}`;
        const params = { page: 1, per_page: 2, sortBy: 'id', orderType: 'desc', search_by: '', valueSearch: '' };
        let last = 0;
        const pacing = api.interceptors.request.use(async config => {
            await new Promise(resolve => setTimeout(resolve, Math.max(0, 1300 - (Date.now() - last))));
            last = Date.now(); return config;
        });
        const check = (value, message) => { if (!value) throw new Error(message); };
        const read = async (domain, parent, page, label) => {
            const response = await api.get(`/${domain}/${parent}/confiscation`, { params: {
                page, per_page: 2, sort_by: 'identificador', type: 'desc',
            } });
            const { data, total, current_page, last_page, per_page } = response.data;
            report.cases.push({ domain, label, requestedPage: page, status: response.status,
                rows: data.length, ids: data.map(row => row.identificador),
                metadata: { total, current_page, last_page, per_page }, keys: Object.keys(response.data) });
            return response.data;
        };
        try {
            for (const suffix of ['A', 'B']) {
                const parent = await parents.create({ fecha: '2026-11-12', observacion: tag + suffix,
                    direccion: 'Prueba ficticia P06', departamento: 'Prueba', municipalidad: 'Prueba', latitud: 14.1, longitud: -87.2 });
                fixtures.push({ service: parents, id: parent.id, domain: 'confiscation' });
            }
            const [a, b] = fixtures.map(item => item.id);
            for (const [domain, relation, catalog] of [
                ['drugConfiscation', 'droga', 'drug'], ['weaponConfiscation', 'arma', 'weapon'],
                ['ammunitionConfiscation', 'municion', 'ammunition'],
            ]) {
                const service = (await import(`/src/modules/${domain}/services/${domain}Service.ts`))[domain + 'Service'];
                const options = (await api.get('/' + catalog, { params: { page: 1, per_page: 2 } })).data.data;
                const input = { cantidad: 1, decomiso: a, [relation]: options[0].identificador };
                if (relation === 'droga') {
                    input.peso = 1;
                    input.presentacion = (await api.get('/drugPresentation', { params: { page: 1, per_page: 2 } })).data.data[0].identificador;
                }
                check((await read(domain, a, 1, 'existing parent without children')).data.length === 0, 'New parent has children');
                const children = [];
                for (let i = 0; i < 3; i++) {
                    const foto = new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='), c => c.charCodeAt(0))], 'p06.png', { type: 'image/png' });
                    const child = await service.create({ ...input, foto });
                    fixtures.push({ service, id: child.identificador, domain }); children.push(child.identificador);
                }
                const first = await read(domain, a, 1, 'first page');
                const lastPage = await read(domain, a, 2, 'last page');
                check(first.total === 3 && lastPage.total === 3 && lastPage.data.length === 1, 'Invalid populated pagination');
                check(first.data[0].identificador > lastPage.data[0].identificador, 'Sort lost');
                await read(domain, a, 3, 'out of range with previous rows');
                check((await read(domain, b, 1, 'other parent remains empty')).data.length === 0, 'Parent isolation lost');
                const remove = async id => {
                    await service.remove(id);
                    fixtures.splice(fixtures.findIndex(item => item.domain === domain && item.id === id), 1);
                };
                await remove(lastPage.data[0].identificador);
                await read(domain, a, 2, 'after deleting last row of last page');
                const remaining = await read(domain, a, 1, 'previous page after delete');
                check(remaining.total === 2 && remaining.data.length === 2, 'Total after delete incorrect');
                for (const row of remaining.data) await remove(row.identificador);
                await read(domain, a, 1, 'after deleting final child');
            }
        } catch (error) { report.failures.push(error instanceof Error ? error.message : JSON.stringify(error).slice(0, 180)); }
        finally {
            for (const item of [...fixtures].reverse()) {
                try { await item.service.remove(item.id); report.cleanup.push({ domain: item.domain, removed: true }); }
                catch { report.cleanup.push({ domain: item.domain, removed: false }); }
            }
            api.interceptors.request.eject(pacing);
        }
        return report;
    });
}
