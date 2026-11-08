import api from '../../../api/graphdataApi';
import type { LoginData, RegisterData, RegisterResponse, SessionResponse, SessionUser } from '../types';

const toSessionUser = ({ user, roles, permissions }: SessionResponse): SessionUser => ({
    nombre: user.name,
    correo: user.email,
    roles,
    permisos: permissions,
});

export const authService = {
    async login({ email, password }: LoginData, signal?: AbortSignal): Promise<SessionUser> {
        const { data } = await api.post<SessionResponse>('/login', { email, password }, { signal });
        return toSessionUser(data);
    },
    async register({ name, email, password }: RegisterData, signal?: AbortSignal): Promise<SessionUser> {
        const { data } = await api.post<RegisterResponse>('/register', { name, email, password }, { signal });
        return 'roles' in data ? toSessionUser(data) : data.user;
    },
    async checkSession(signal?: AbortSignal): Promise<SessionUser> {
        const { data } = await api.post<SessionResponse>('/refresh', undefined, { signal });
        return toSessionUser(data);
    },
    async logout(signal?: AbortSignal): Promise<void> {
        await api.post('/logout', undefined, { signal });
    },
};
