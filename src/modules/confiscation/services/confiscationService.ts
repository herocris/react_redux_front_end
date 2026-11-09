import api from '../../../api/graphdataApi';
import type { ListParams } from '../../../api/catalog';
import type { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import type { Confiscation } from '../types';

export type ConfiscationEntity = Confiscation & { id: string };
type Response = Omit<Confiscation, 'id' | 'identificador'> & { identificador: string };
const toEntity = ({ identificador: id, ...rest }: Response): ConfiscationEntity => ({ id, ...rest });
export const confiscationService = {
    async list({ page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<TableOptions & { data: Response[] }>(
            `/confiscation?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    async detail(id: string, signal?: AbortSignal) {
        const { data } = await api.get<Response>(`/confiscation/${id}`, { signal });
        return toEntity(data);
    },
    async create(values: Confiscation, signal?: AbortSignal) {
        const { data } = await api.post<Response>('/confiscation', values, { signal });
        return toEntity(data);
    },
    async update(values: Confiscation & { id: string }, signal?: AbortSignal) {
        const { data } = await api.put<Response>(`/confiscation/${values.id}`, values, { signal });
        return toEntity(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> {
        await api.delete(`/confiscation/${id}`, { signal });
    },
};
