import { readId } from '../../../api/identifiers';
import api from '../../../api/graphdataApi';
import type { ListParams } from '../../../api/catalog';
import { readSublistPagination, type SublistResponse } from '../../../api/sublistPagination';
import type { DrugConfiscation } from '../types';

type Relation = { identificador: number; descripcion: string };
type Response = Omit<DrugConfiscation, 'identificador' | 'decomiso' | 'droga' | 'presentacion'> & {
    identificador: number;
    decomiso: { identificador: number };
    droga: Relation;
    presentacion: Relation;
};
const toEntity = ({ decomiso, droga, presentacion, ...rest }: Response): DrugConfiscation => ({
    decomiso: readId(decomiso.identificador), droga: readId(droga.identificador), droga_nombre: droga.descripcion,
    presentacion: readId(presentacion.identificador), presentacion_nombre: presentacion.descripcion,
    ...rest, identificador: readId(rest.identificador),
});
export const drugConfiscationService = {
    async list(parent: number, params: ListParams, signal?: AbortSignal) {
        const { page, sortBy, orderType, per_page, search_by, valueSearch } = params;
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data } = await api.get<SublistResponse<Response>>(
            `/drugConfiscation/${readId(parent)}/confiscation?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.data.map(toEntity), tableOptions: readSublistPagination(data, params) };
    },
    async create(values: DrugConfiscation, signal?: AbortSignal) {
        const { data } = await api.post<Response>('/drugConfiscation', values,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: DrugConfiscation & { identificador: number }, signal?: AbortSignal) {
        const payload = new FormData();
        payload.append('cantidad', values.cantidad.toString());
        payload.append('peso', values.peso.toString());
        payload.append('decomiso', values.decomiso.toString());
        payload.append('droga', values.droga.toString());
        payload.append('presentacion', values.presentacion.toString());
        if (values.foto instanceof File) payload.append('foto', values.foto);
        payload.append('_method', 'PUT');
        const { data } = await api.post<Response>(`/drugConfiscation/${readId(values.identificador)}`, payload,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: number, signal?: AbortSignal): Promise<void> {
        await api.delete(`/drugConfiscation/${readId(id)}`, { signal });
    },
};
