import api from '../../../api/graphdataApi';
import type { ListParams } from '../../../api/catalog';
import type { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import type { AmmunitionConfiscation } from '../types';

type Relation = { identificador: number; descripcion: string };
type Response = Omit<AmmunitionConfiscation, 'decomiso' | 'municion'> & {
    decomiso: { identificador: number };
    municion: Relation;
};
const toEntity = ({ decomiso, municion, ...rest }: Response): AmmunitionConfiscation => ({
    decomiso: decomiso.identificador, municion: municion.identificador, municion_nombre: municion.descripcion,

    ...rest,
});
export const ammunitionConfiscationService = {
    async list(parent: string, { page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<TableOptions & { data: Response[] }>(
            `/ammunitionConfiscation/${parent}/confiscation?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    async create(values: AmmunitionConfiscation, signal?: AbortSignal) {
        const { data } = await api.post<Response>('/ammunitionConfiscation', values,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: AmmunitionConfiscation & { identificador: string }, signal?: AbortSignal) {
        const payload = new FormData();
        payload.append('cantidad', values.cantidad.toString());

        payload.append('decomiso', values.decomiso.toString());
        payload.append('municion', values.municion.toString());

        if (values.foto instanceof File) payload.append('foto', values.foto);
        payload.append('_method', 'PUT');
        const { data } = await api.post<Response>(`/ammunitionConfiscation/${values.identificador}`, payload,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> {
        await api.delete(`/ammunitionConfiscation/${id}`, { signal });
    },
};
