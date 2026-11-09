import api from '../../../api/graphdataApi';
import { readCatalog, type ListParams } from '../../../api/catalog';
import type { Weapon, WeaponEntity, WeaponResponse, WeaponListResponse } from '../types';
const toEntity = ({ identificador: id, ...rest }: WeaponResponse): WeaponEntity => ({ id, ...rest });
export const weaponService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<WeaponListResponse>(
            `/weapon?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    catalog(signal?: AbortSignal): Promise<WeaponEntity[]> { return readCatalog(weaponService.list, signal); },
    async create(values: Weapon, signal?: AbortSignal): Promise<WeaponEntity> {
        const { data } = await api.post<WeaponResponse>('/weapon', values, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: Weapon & { id: string }, signal?: AbortSignal): Promise<WeaponEntity> {
        const payload = new FormData();
        payload.append('descripcion', values.descripcion);
        if (values.logo instanceof File) payload.append('logo', values.logo);
        payload.append('_method', 'PUT');
        const { data } = await api.post<WeaponResponse>(`/weapon/${values.id}`, payload, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> { await api.delete(`/weapon/${id}`, { signal }); },
};
