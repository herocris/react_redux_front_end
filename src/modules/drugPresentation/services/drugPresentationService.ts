import { readId } from '../../../api/identifiers';
import api from '../../../api/graphdataApi';
import { readCatalog, type ListParams } from '../../../api/catalog';
import type { DrugPresentation, DrugPresentationEntity, DrugPresentationResponse, DrugPresentationListResponse } from '../types';
const toEntity = ({ identificador: id, ...rest }: DrugPresentationResponse): DrugPresentationEntity => ({ ...rest, id: readId(id) });
export const drugPresentationService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<DrugPresentationListResponse>(
            `/drugPresentation?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    catalog(signal?: AbortSignal): Promise<DrugPresentationEntity[]> { return readCatalog(drugPresentationService.list, signal); },
    async create(values: DrugPresentation, signal?: AbortSignal): Promise<DrugPresentationEntity> {
        const { data } = await api.post<DrugPresentationResponse>('/drugPresentation', values, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: DrugPresentation & { id: number }, signal?: AbortSignal): Promise<DrugPresentationEntity> {
        const payload = new FormData();
        payload.append('descripcion', values.descripcion);
        if (values.logo instanceof File) payload.append('logo', values.logo);
        payload.append('_method', 'PUT');
        const { data } = await api.post<DrugPresentationResponse>(`/drugPresentation/${readId(values.id)}`, payload, { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: number, signal?: AbortSignal): Promise<void> { await api.delete(`/drugPresentation/${readId(id)}`, { signal }); },
};
