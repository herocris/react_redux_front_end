import { readId } from '../../../api/identifiers';
import api from '../../../api/graphdataApi';
import { readCatalog, type ListParams } from '../../../api/catalog';
import type { User, UserEntity, UserResponse, UserListResponse } from '../types';
const toEntity = ({ identificador: id, ...rest }: UserResponse): UserEntity => ({ ...rest, id: readId(id), roles: rest.roles?.map(readId), permisos: rest.permisos?.map(readId) });
export const userService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<UserListResponse>(
            `/user?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    catalog(signal?: AbortSignal): Promise<UserEntity[]> { return readCatalog(userService.list, signal); },
    async create(values: User, signal?: AbortSignal): Promise<UserEntity> {
        const { data } = await api.post<UserResponse>('/user', values, { signal });
        return toEntity(data);
    },
    async update(values: User & { id: number }, signal?: AbortSignal): Promise<UserEntity> {
        const { data } = await api.put<UserResponse>(`/user/${readId(values.id)}`, values, { signal });
        return toEntity(data);
    },
    async remove(id: number, signal?: AbortSignal): Promise<void> { await api.delete(`/user/${readId(id)}`, { signal }); },
};
