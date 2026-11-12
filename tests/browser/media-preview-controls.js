// Isolated RHF/PhotoInput lifecycle. No records created and no HTTP interception.
async (page) => {
    const passed = [];
    try {
        await page.evaluate(async () => {
            const resource = pattern => performance.getEntriesByType('resource').find(entry => pattern.test(entry.name))?.name;
            const react = await import(resource(/deps\/react\.js/));
            const React = react.default || react;
            const client = await import(resource(/deps\/react-dom_client\.js/));
            const { createRoot } = client.default || client;
            const { useForm } = await import('/node_modules/.vite/deps/react-hook-form.js');
            const { PhotoInput } = await import('/src/components/PhotoInput.tsx');
            const host = document.createElement('div'); host.id = 'p07-preview-controls';
            Object.assign(host.style, { position: 'fixed', inset: '0', zIndex: '1200', background: 'white' });
            document.body.append(host);
            const root = createRoot(host);
            const created = [], revoked = [];
            const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
            URL.createObjectURL = file => { const url = create(file); created.push(url); return url; };
            URL.revokeObjectURL = url => { revoked.push(url); revoke(url); };
            const fixture = { created, revoked, reference: 'drug/PORTFOLIO_P07_unavailable.png' };
            window.__p07Preview = fixture;
            function Form() {
                const form = useForm({ defaultValues: { photos: [fixture.reference] } });
                fixture.form = form;
                return React.createElement(PhotoInput, { control: form.control, name: 'photos', multiple: true, label: 'Fotos P07' });
            }
            fixture.unmount = () => { root.unmount(); host.remove(); };
            fixture.restore = () => { URL.createObjectURL = create; URL.revokeObjectURL = revoke; delete window.__p07Preview; };
            root.render(React.createElement(Form));
        });
        const host = page.locator('#p07-preview-controls');
        await host.getByRole('img', { name: 'Imagen no disponible', exact: true }).waitFor();
        const check = (value, message) => { if (!value) throw new Error(message); };
        check(await page.evaluate(() => window.__p07Preview.form.getValues('photos')[0] === window.__p07Preview.reference), 'Unavailable reference was modified');
        passed.push('failed preview preserves exact RHF reference and removable placeholder');
        await page.evaluate(() => {
            const c = document.createElement('canvas'); c.width = c.height = 16;
            const bytes = Uint8Array.from(atob(c.toDataURL('image/png').split(',')[1]), c => c.charCodeAt(0));
            window.__p07Preview.file = new File([bytes], 'p07.png', { type: 'image/png' });
            window.__p07Preview.form.setValue('photos', [window.__p07Preview.reference, window.__p07Preview.file]);
        });
        await host.locator('img[src^="blob:"]').waitFor();
        await host.getByRole('button', { name: 'Eliminar imagen 1', exact: true }).click();
        check(await page.evaluate(() => {
            const f = window.__p07Preview;
            return f.form.getValues('photos').length === 1 && f.form.getValues('photos')[0] === f.file;
        }), 'Multiple removal index changed');
        await page.waitForFunction(() => window.__p07Preview.revoked.length > 0);
        passed.push('removing failed reference preserves next File and releases superseded object URL');
        await page.evaluate(() => window.__p07Preview.unmount());
        check(await page.evaluate(() => {
            const f = window.__p07Preview;
            return f.created.length >= 2 && f.created.every(url => f.revoked.includes(url));
        }), 'Unmount leaked object URLs');
        passed.push('unmount releases every remaining object URL');
        return { passed };
    } finally {
        await page.evaluate(() => { window.__p07Preview?.unmount(); window.__p07Preview?.restore(); });
    }
}
