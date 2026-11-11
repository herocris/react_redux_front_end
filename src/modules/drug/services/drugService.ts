import { readId } from '../../../api/identifiers';
import api from '../../../api/graphdataApi';
import { readCatalog, type ListParams } from '../../../api/catalog';
import type { Drug, DrugEntity, DrugResponse, DrugListResponse } from '../types';
const toEntity = ({ identificador: id, ...rest }: DrugResponse): DrugEntity => ({ ...rest, id: readId(id) });
export const drugService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<DrugListResponse>(
            `/drug?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    catalog(signal?: AbortSignal): Promise<DrugEntity[]> { return readCatalog(drugService.list, signal); },
    async create(values: Drug, signal?: AbortSignal): Promise<DrugEntity> {
        const { data } = await api.post<DrugResponse>('/drug', values, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: Drug & { id: number }, signal?: AbortSignal): Promise<DrugEntity> {
        const payload = new FormData();
        payload.append('descripcion', values.descripcion);
        if (values.logo instanceof File) payload.append('logo', values.logo);
        payload.append('_method', 'PUT');
        const { data } = await api.post<DrugResponse>(`/drug/${readId(values.id)}`, payload, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: number, signal?: AbortSignal): Promise<void> { await api.delete(`/drug/${readId(id)}`, { signal }); },
};
