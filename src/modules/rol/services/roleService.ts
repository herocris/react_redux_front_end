import api from '../../../api/graphdataApi';
import { readCatalog, type ListParams } from '../../../api/catalog';
import type { Role, RoleEntity, RoleResponse, RoleListResponse } from '../types';
const toEntity = ({ identificador: id, ...rest }: RoleResponse): RoleEntity => ({ id, ...rest });
export const roleService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<RoleListResponse>(
            `/role?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    catalog(signal?: AbortSignal): Promise<RoleEntity[]> { return readCatalog(roleService.list, signal); },
    async create(values: Role, signal?: AbortSignal): Promise<RoleEntity> {
        const { data } = await api.post<RoleResponse>('/role', values, { signal });
        return toEntity(data);
    },
    async update(values: Role & { id: string }, signal?: AbortSignal): Promise<RoleEntity> {
        const { data } = await api.put<RoleResponse>(`/role/${values.id}`, values, { signal });
        return toEntity(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> { await api.delete(`/role/${id}`, { signal }); },
};
