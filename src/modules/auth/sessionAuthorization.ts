import type { AuthState, SessionUser } from './types';

const sameNames = (left: string[] = [], right: string[] = []) => {
    const names = new Set(left);
    return names.size === new Set(right).size && right.every(name => names.has(name));
};

// The current session contract has no user ID. Email is its identity boundary.
export const authorizationChanged = (auth: AuthState, user: SessionUser) =>
    auth.authorizationError !== null || auth.user.correo !== user.correo ||
    !sameNames(auth.user.permisos, user.permisos) || !sameNames(auth.user.roles, user.roles);
