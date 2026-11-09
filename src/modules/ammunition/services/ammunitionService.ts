import api from '../../../api/graphdataApi';
import { readCatalog, type ListParams } from '../../../api/catalog';
import type { Ammunition, AmmunitionEntity, AmmunitionResponse, AmmunitionListResponse } from '../types';
const toEntity = ({ identificador: id, ...rest }: AmmunitionResponse): AmmunitionEntity => ({ id, ...rest });
export const ammunitionService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<AmmunitionListResponse>(
            `/ammunition?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    catalog(signal?: AbortSignal): Promise<AmmunitionEntity[]> { return readCatalog(ammunitionService.list, signal); },
    async create(values: Ammunition, signal?: AbortSignal): Promise<AmmunitionEntity> {
        const { data } = await api.post<AmmunitionResponse>('/ammunition', values, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: Ammunition & { id: string }, signal?: AbortSignal): Promise<AmmunitionEntity> {
        const payload = new FormData();
        payload.append('descripcion', values.descripcion);
        if (values.logo instanceof File) payload.append('logo', values.logo);
        payload.append('_method', 'PUT');
        const { data } = await api.post<AmmunitionResponse>(`/ammunition/${values.id}`, payload, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> { await api.delete(`/ammunition/${id}`, { signal }); },
};
