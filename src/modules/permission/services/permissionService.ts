import { readId } from '../../../api/identifiers';
import api from '../../../api/graphdataApi';
import type {
    Permission, PermissionEntity, PermissionListParams, PermissionListResponse,
    PermissionListResult, PermissionResponse,
} from '../types';

const toPermission = ({ identificador: id, ...rest }: PermissionResponse): PermissionEntity => ({ ...rest, id: readId(id) });

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
    async catalog(signal?: AbortSignal): Promise<PermissionEntity[]> {
        const permissions: PermissionEntity[] = [];
        let page = 1;
        let expectedTotal: number | undefined;
        let lastPage: number | undefined;
        const ids = new Set<number>();
        do {
            const result = await permissionService.list({ page, sortBy: 'id', orderType: 'asc',
                per_page: 100, search_by: '', valueSearch: '' }, signal);
            const { total, current_page, last_page } = result.tableOptions;
            // The endpoint is paginated. Never publish a partial or inconsistent catalog.
            if (!Number.isInteger(total) || total < 0 || current_page !== page ||
                !Number.isInteger(last_page) || last_page < 1 ||
                (expectedTotal !== undefined && (total !== expectedTotal || last_page !== lastPage))) {
                throw new Error('No se pudo verificar el catálogo completo de permisos.');
            }
            expectedTotal = total;
            lastPage = last_page;
            for (const permission of result.permissions) {
                if (ids.has(permission.id)) throw new Error('El catálogo de permisos contiene páginas repetidas.');
                ids.add(permission.id);
                permissions.push(permission);
            }
            if (page < last_page && result.permissions.length === 0) {
                throw new Error('El catálogo de permisos está incompleto.');
            }
            page++;
        } while (page <= lastPage!);
        if (permissions.length !== expectedTotal) throw new Error('El catálogo de permisos está incompleto.');
        return permissions;
    },
    // Se conserva el payload heredado, incluidos id/identificador si el consumidor los aporta.
    async create(permission: Permission, signal?: AbortSignal): Promise<PermissionEntity> {
        const { data } = await api.post<PermissionResponse>('/permission', permission, { signal });
        return toPermission(data);
    },
    async update(permission: Permission & { id: number }, signal?: AbortSignal): Promise<PermissionEntity> {
        const { data } = await api.put<PermissionResponse>(`/permission/${readId(permission.id)}`, permission, { signal });
        return toPermission(data);
    },
    async remove(id: number, signal?: AbortSignal): Promise<void> {
        await api.delete(`/permission/${readId(id)}`, { signal });
    },
};
