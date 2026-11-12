// Execute with Playwright MCP browser_run_code_unsafe, filename, on an
// authenticated Vite development page. Creates persistent demo data.
// Save the returned inventory before navigating. See docs/demo-guide.md.
async (page) => {
    return page.evaluate(async () => {
        const { default: definition } = await import('/docs/demo-data-p12.json');
        const { store } = await import('/src/store/store.ts');
        const permissions = store.getState().auth.user.permisos ?? [];
        const domains = ['drug', 'drugPresentation', 'weapon', 'ammunition', 'confiscation',
            'drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation'];
        const report = { prefix: definition.prefix, records: [], verified: [], cleanup: [], complete: false };
        const services = {};
        const params = { page: 1, per_page: 100, sortBy: 'id', orderType: 'desc', search_by: '', valueSearch: '' };
        const pause = () => new Promise(resolve => setTimeout(resolve, 1400));
        for (const domain of domains) {
            if (!['view', 'create', 'delete'].every(action => permissions.includes(`${domain}.${action}`))) {
                throw new Error(`Missing permission for preparation/rollback in ${domain}`);
            }
            services[domain] = (await import(`/src/modules/${domain}/services/${domain}Service.ts`))[`${domain}Service`];
        }
        // Refuse duplicates before the first write. Existing rows are never adopted.
        for (const domain of ['drug', 'drugPresentation', 'weapon', 'ammunition', 'confiscation']) {
            await pause();
            const search_by = domain === 'confiscation' ? 'observacion' : 'descripcion';
            const found = await services[domain].list({ ...params, search_by, valueSearch: definition.prefix });
            if (found.rows.length || found.tableOptions.total !== 0) {
                throw new Error(`Existing ${definition.prefix} records in ${domain}. Review inventory before restoring.`);
            }
        }
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 160;
        const context = canvas.getContext('2d');
        context.fillStyle = '#14354b';
        context.fillRect(0, 0, 240, 160);
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px sans-serif';
        context.fillText('DEMO', 62, 78);
        context.font = '18px sans-serif';
        context.fillText('Imagen ficticia', 58, 110);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Unable to prepare the demonstration image');
        const picture = () => new File([blob], 'demo-p12-ficticia.png', { type: 'image/png' });
        const create = async (domain, values, parent) => {
            await pause();
            const row = await services[domain].create(values);
            const record = { domain, id: row.id ?? row.identificador };
            if (parent) record.parent = parent;
            if (row.logo || row.foto) record.media = row.logo || row.foto;
            report.records.push(record);
            // Survives loss of the tool response within this browser context.
            sessionStorage.setItem('demo-p12-preparation', JSON.stringify(report));
            return record.id;
        };
        try {
            const catalogs = {};
            for (const [domain, descripcion] of Object.entries(definition.catalogs)) {
                catalogs[domain] = await create(domain, { descripcion, logo: picture() });
            }
            for (const scenario of definition.confiscations) {
                const { drugQuantity, drugWeight, weaponQuantity, ammunitionQuantity, ...values } = scenario;
                const parent = await create('confiscation', values);
                await create('drugConfiscation', { decomiso: parent, droga: catalogs.drug,
                    presentacion: catalogs.drugPresentation, cantidad: drugQuantity, peso: drugWeight, foto: picture() }, parent);
                await create('weaponConfiscation', { decomiso: parent, arma: catalogs.weapon,
                    cantidad: weaponQuantity, foto: picture() }, parent);
                await create('ammunitionConfiscation', { decomiso: parent, municion: catalogs.ammunition,
                    cantidad: ammunitionQuantity, foto: picture() }, parent);
                for (const domain of ['drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation']) {
                    await pause();
                    const result = await services[domain].list(parent, params);
                    const own = report.records.find(row => row.domain === domain && row.parent === parent);
                    if (result.rows.length !== 1 || result.rows[0].identificador !== own.id) {
                        throw new Error(`Unexpected persisted children in ${domain}/${parent}`);
                    }
                    report.verified.push({ domain, parent, rows: 1 });
                }
            }
            report.complete = true;
        } catch (error) {
            report.error = error instanceof Error ? error.message : 'Preparation failed. Inspect API response locally.';
            // Roll back only IDs acknowledged during this execution. A lost write
            // response requires reconciliation by prefix before any retry.
            for (const record of [...report.records].reverse()) {
                await pause();
                try {
                    await services[record.domain].remove(record.id);
                    report.cleanup.push({ domain: record.domain, id: record.id, removed: true });
                } catch {
                    report.cleanup.push({ domain: record.domain, id: record.id, removed: false });
                }
            }
        }
        sessionStorage.setItem('demo-p12-preparation', JSON.stringify(report));
        return report;
    });
}
