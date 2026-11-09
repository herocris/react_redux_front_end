import api from '../../../api/graphdataApi';
import type { ListParams } from '../../../api/catalog';
import type { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import type { WeaponConfiscation } from '../types';

type Relation = { identificador: number; descripcion: string };
type Response = Omit<WeaponConfiscation, 'decomiso' | 'arma'> & {
    decomiso: { identificador: number };
    arma: Relation;
};
const toEntity = ({ decomiso, arma, ...rest }: Response): WeaponConfiscation => ({
    decomiso: decomiso.identificador, arma: arma.identificador, arma_nombre: arma.descripcion,

    ...rest,
});
export const weaponConfiscationService = {
    async list(parent: string, { page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<TableOptions & { data: Response[] }>(
            `/weaponConfiscation/${parent}/confiscation?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    async create(values: WeaponConfiscation, signal?: AbortSignal) {
        const { data } = await api.post<Response>('/weaponConfiscation', values,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: WeaponConfiscation & { identificador: string }, signal?: AbortSignal) {
        const payload = new FormData();
        payload.append('cantidad', values.cantidad.toString());

        payload.append('decomiso', values.decomiso.toString());
        payload.append('arma', values.arma.toString());

        if (values.foto instanceof File) payload.append('foto', values.foto);
        payload.append('_method', 'PUT');
        const { data } = await api.post<Response>(`/weaponConfiscation/${values.identificador}`, payload,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: string, signal?: AbortSignal): Promise<void> {
        await api.delete(`/weaponConfiscation/${id}`, { signal });
    },
};
