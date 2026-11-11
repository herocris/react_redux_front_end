// Manual provisioning against the real backend from an authenticated Vite page.
// User-authorized persistent records: idempotent by name; never changes existing
// users, roles with different definitions, or pre-existing permissions.
async (page) => page.evaluate(async () => {
    const { permissionService } = await import('/src/modules/permission/services/permissionService.ts');
    const { roleService } = await import('/src/modules/rol/services/roleService.ts');
    const { default: api } = await import('/src/api/graphdataApi.ts');
    const crud = ['view', 'create', 'update', 'delete'];
    const catalogs = ['drug', 'drugPresentation', 'weapon', 'ammunition'];
    const records = ['confiscation', 'drugConfiscation', 'weaponConfiscation', 'ammunitionConfiscation'];
    const administration = ['user', 'role', 'permission'];
    const analysis = ['dashboard', 'graph', 'map'];
    const names = [
        ...[...administration, ...catalogs, ...records].flatMap(domain => crud.map(action => `${domain}.${action}`)),
        ...[...analysis, 'activity'].map(domain => `${domain}.view`),
    ];
    const definitions = [
        { nombre: 'administrador', permissions: names },
        { nombre: 'operador', permissions: [
            ...records.flatMap(domain => crud.map(action => `${domain}.${action}`)),
            ...[...catalogs, ...analysis].map(domain => `${domain}.view`),
        ] },
        { nombre: 'analista', permissions: [...catalogs, ...records, ...analysis].map(domain => `${domain}.view`) },
    ];
    const created = { permissions: [], roles: [] };
    const pacing = api.interceptors.request.use(async config => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return config;
    });
    try {
        const permissions = await permissionService.catalog();
        const roles = await roleService.catalog();
        for (const nombre of names) {
            if (permissions.some(permission => permission.nombre === nombre)) continue;
            const item = await permissionService.create({ nombre });
            if (item.id === undefined) throw new Error(`Missing permission ID: ${nombre}`);
            permissions.push(item);
            created.permissions.push(item);
        }
        const resolvedRoles = [];
        for (const definition of definitions) {
            const permisos = definition.permissions.map(nombre => permissions.find(item => item.nombre === nombre).id);
            let role = roles.find(item => item.nombre === definition.nombre);
            if (!role) {
                role = await roleService.create({ nombre: definition.nombre, permisos });
                if (role.id === undefined) throw new Error(`Missing role ID: ${definition.nombre}`);
                created.roles.push({ id: role.id, nombre: role.nombre });
            }
            resolvedRoles.push({ id: role.id, nombre: role.nombre, permissionIds: permisos, permissions: definition.permissions });
        }
        const storedRoles = await roleService.catalog();
        for (const role of resolvedRoles) {
            const stored = storedRoles.find(item => item.id === role.id);
            const ids = (stored?.permisos ?? []).map(value => typeof value === 'object' ? value.identificador ?? value.id : value).map(String).sort();
            if (JSON.stringify(ids) !== JSON.stringify(role.permissionIds.map(String).sort())) {
                throw new Error(`Stored role differs from intended permissions: ${role.nombre}`);
            }
        }
        return { status: 'PASS', created, permissions: permissions.filter(item => names.includes(item.nombre)), roles: resolvedRoles };
    } catch (error) {
        return { status: 'FAIL', error: error instanceof Error ? error.message : JSON.stringify(error), created };
    } finally {
        api.interceptors.request.eject(pacing);
    }
})
