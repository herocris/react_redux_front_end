import type { SessionUser } from './types';

export type AccessDomain = 'user' | 'role' | 'permission' | 'activity' | 'drug' |
    'drugPresentation' | 'weapon' | 'ammunition' | 'confiscation' |
    'drugConfiscation' | 'weaponConfiscation' | 'ammunitionConfiscation' | 'dashboard' | 'graph' | 'map';
export type AccessAction = 'view' | 'create' | 'update' | 'delete';

const catalogDependencies: Partial<Record<AccessDomain, AccessDomain[]>> = {
    user: ['role', 'permission'], role: ['permission'],
    drugConfiscation: ['drug', 'drugPresentation'],
    weaponConfiscation: ['weapon'], ammunitionConfiscation: ['ammunition'],
};
const viewDependencies: Partial<Record<AccessDomain, AccessDomain[]>> = {
    // The dashboard is a navigation hub; each destination checks its own access.
    graph: ['drug', 'weapon', 'ammunition'], map: ['drug', 'weapon', 'ammunition'],
};

// The backend supplies the effective union. Role names never grant access here.
export const canAccess = (user: SessionUser, domain: AccessDomain, action: AccessAction = 'view'): boolean => {
    const permissions = user.permisos ?? [];
    if (!permissions.includes(`${domain}.view`) || !permissions.includes(`${domain}.${action}`)) return false;
    const dependencies = action === 'create' || action === 'update' ? catalogDependencies[domain] : [];
    return [...(viewDependencies[domain] ?? []), ...(dependencies ?? [])]
        .every(dependency => permissions.includes(`${dependency}.view`));
};

export const accessDestinations: { path: string; domain: AccessDomain }[] = [
    { path: '/dashboard', domain: 'dashboard' }, { path: '/confiscation', domain: 'confiscation' },
    { path: '/drug', domain: 'drug' }, { path: '/weapon', domain: 'weapon' },
    { path: '/ammunition', domain: 'ammunition' }, { path: '/drugPresentation', domain: 'drugPresentation' },
    { path: '/graph', domain: 'graph' }, { path: '/map', domain: 'map' },
    { path: '/user', domain: 'user' }, { path: '/rol', domain: 'role' },
    { path: '/permiso', domain: 'permission' }, { path: '/actividad', domain: 'activity' },
];
export const firstAllowedPath = (user: SessionUser) => accessDestinations.find(item => canAccess(user, item.domain))?.path;
