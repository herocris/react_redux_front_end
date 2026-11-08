import api from '../../../api/graphdataApi';
import type {
    Permission, PermissionEntity, PermissionListParams, PermissionListResponse,
    PermissionListResult, PermissionResponse,
} from '../types';

const toPermission = ({ identificador: id, ...rest }: PermissionResponse): PermissionEntity => ({ id, ...rest });

const listUrl = ({ page, sortBy, orderType, per_page, search_by, valueSearch }: PermissionListParams): string => {
    const sort = sortBy === 'id' ? 'identificador' : sortBy;
    // Conservar la serialización del listado antiguo durante esta extracción.
    return `/permission?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`;
};

export const permissionService = {
    async list(params: PermissionListParams, signal?: AbortSignal): Promise<PermissionListResult> {
        const { data: { data, ...tableOptions } } = await api.get<PermissionListResponse>(listUrl(params), { signal });
        return { permissions: data.map(toPermission), tableOptions };
    },
    // Se conserva el payload heredado, incluidos id/identificador si el consumidor los aporta.
    async create(permission: Permission, signal?: AbortSignal): Promise<PermissionEntity> {
        const { data } = await api.post<PermissionResponse>('/permission', permission, { signal });
        return toPermission(data);
    },
    async update(permission: Permission & { id: string }, signal?: AbortSignal): Promise<PermissionEntity> {
        const { data } = await api.put<PermissionResponse>(`/permission/${permission.id}`, permission, { signal });
        return toPermission(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> {
        await api.delete(`/permission/${id}`, { signal });
    },
};
