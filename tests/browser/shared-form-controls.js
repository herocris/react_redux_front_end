async (page) => {
    const passed = [], errors = [], messages = [];
    const check = (value, message) => { if (!value) throw new Error(message); };
    const onError = error => errors.push(error.message);
    const onConsole = message => {
        if (['error', 'warning'].includes(message.type())) messages.push(message.text().slice(0, 250));
    };
    page.on('pageerror', onError); page.on('console', onConsole);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    const images = route => route.request().resourceType() === 'image'
        ? route.fulfill({ contentType: 'image/png', body: png }) : route.fallback();
    await page.route('**/*', images);
    try {
        await page.evaluate(async () => {
            const resource = pattern => performance.getEntriesByType('resource').find(entry => pattern.test(entry.name))?.name;
            const reactModule = await import(resource(/deps\/react\.js/));
            const React = reactModule.default || reactModule;
            const client = await import(resource(/deps\/react-dom_client\.js/));
            const { createRoot } = client.default || client;
            const { useForm } = await import('/node_modules/.vite/deps/react-hook-form.js');
            const { OptionSelector } = await import('/src/components/OptionSelector.tsx');
            const { MultipleSelectButton } = await import('/src/components/MultipleSelectButton.tsx');
            const { DatePickerField } = await import('/src/components/DatePickerField.tsx');
            const { PhotoInput } = await import('/src/components/PhotoInput.tsx');
            const host = document.createElement('div');
            host.id = 'shared-controls-fixture';
            Object.assign(host.style, { position: 'fixed', inset: '0', zIndex: '1200', background: 'white', overflow: 'auto' });
            document.body.append(host);
            const root = createRoot(host);
            const defaults = { mode: 'b', single: 0, many: [2], date: '2026-11-08', photo: 'existing.png' };
            const urls = [], revoked = [];
            const originalCreate = URL.createObjectURL, originalRevoke = URL.revokeObjectURL;
            URL.createObjectURL = file => { const url = originalCreate(file); urls.push(url); return url; };
            URL.revokeObjectURL = url => { revoked.push(url); originalRevoke(url); };
            const fixture = { urls, revoked };
            window.__sharedControlsFixture = fixture;
            const h = React.createElement;
            function Form() {
                const form = useForm({ defaultValues: defaults });
                fixture.form = form;
                return h('form', null,
                    h(OptionSelector, { control: form.control, name: 'mode', iconList: ['a', 'b'].map(value => ({
                        value, label: value === 'a' ? 'Modo A' : 'Modo B', icono: h('span', null, value),
                    })) }),
                    h(MultipleSelectButton, { control: form.control, name: 'single', label: 'Único', multiple: false,
                        options: [{ value: 0, description: 'Cero' }, { value: '007', description: 'Código' }] }),
                    h(MultipleSelectButton, { control: form.control, name: 'many', label: 'Varios', multiple: true,
                        options: [{ value: 2, description: 'Dos' }, { value: '007', description: 'Código' }] }),
                    h(DatePickerField, { control: form.control, name: 'date', label: 'Fecha de prueba' }),
                    h(PhotoInput, { control: form.control, name: 'photo', label: 'Foto de prueba' }),
                );
            }
            fixture.dispose = () => {
                root.unmount(); host.remove();
                URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke;
                delete window.__sharedControlsFixture;
            };
            root.render(h(Form));
        });
        const host = page.locator('#shared-controls-fixture');
        const selected = name => host.getByRole('button', { name, exact: true }).evaluate(el => el.classList.contains('Mui-selected'));
        await host.getByRole('button', { name: 'Modo B', exact: true }).waitFor();
        check(await selected('Modo B'), 'RHF default mode not selected');
        await host.getByRole('button', { name: 'Modo A', exact: true }).click();
        check(await page.evaluate(() => window.__sharedControlsFixture.form.getValues('mode')) === 'a', 'Option event lost');
        await page.evaluate(() => window.__sharedControlsFixture.form.reset({ mode: 'b', single: '007', many: ['007'], date: '2026-12-15', photo: 'reset.png' }));
        await page.waitForFunction(() => document.querySelector('#shared-controls-fixture button[aria-label="Modo B"]')?.classList.contains('Mui-selected'));
        check(await selected('Modo B'), 'reset did not restore visual selection');
        passed.push('selector derives initial value, events and reset from RHF');
        check(await host.getByRole('combobox', { name: 'Único' }).innerText() === 'Código', 'string identifier changed');
        await host.getByRole('combobox', { name: 'Único' }).click();
        await page.getByRole('option', { name: 'Cero', exact: true }).click();
        check(await page.evaluate(() => window.__sharedControlsFixture.form.getValues('single')) === 0, 'numeric zero lost');
        await host.getByRole('combobox', { name: 'Varios' }).click();
        await page.getByRole('option', { name: 'Dos', exact: true }).click();
        await page.keyboard.press('Escape');
        check(await page.evaluate(() => JSON.stringify(window.__sharedControlsFixture.form.getValues('many'))) === '["007",2]', 'multiple identifiers coerced');
        passed.push('single zero and multiple mixed identifiers preserve values and reset');
        check(await host.locator('input[name="date"]').inputValue() === '15/12/2026', 'date reset not reflected');
        await host.getByRole('button', { name: /Choose date/ }).click();
        await page.getByRole('gridcell', { name: '16', exact: true }).click();
        check(await page.evaluate(() => window.__sharedControlsFixture.form.getValues('date').format('YYYY-MM-DD')) === '2026-12-16', 'date change lost');
        passed.push('date string reset and Dayjs change remain synchronized');
        check((await host.locator('img').getAttribute('src')).endsWith('/reset.png'), 'existing photo reset lost');
        await host.locator('input[type="file"]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png });
        await host.locator('img[src^="blob:"]').waitFor();
        await page.evaluate(() => window.__sharedControlsFixture.form.reset({ mode: 'a', single: 0, many: [], date: '', photo: 'restored.png' }));
        await page.waitForFunction(() => window.__sharedControlsFixture.revoked.length === 1);
        check((await host.locator('img').getAttribute('src')).endsWith('/restored.png'), 'photo not restored');
        await host.getByRole('button', { name: 'Eliminar imagen 1' }).click();
        check(await page.evaluate(() => window.__sharedControlsFixture.form.getValues('photo')) === null, 'photo removal lost');
        check(await host.locator('input[name="date"]').inputValue() === '', 'empty date reset not reflected');
        passed.push('photo File, reset, object URL cleanup and removal follow RHF');
        check(errors.length === 0 && messages.length === 0, JSON.stringify({ errors, messages }));
        return { passed, errors, messages };
    } finally {
        await page.evaluate(() => window.__sharedControlsFixture?.dispose());
        await page.unroute('**/*', images);
        page.off('pageerror', onError); page.off('console', onConsole);
    }
}
