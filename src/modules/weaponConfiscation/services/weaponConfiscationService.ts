import { readId } from '../../../api/identifiers';
import api from '../../../api/graphdataApi';
import type { ListParams } from '../../../api/catalog';
import type { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import type { WeaponConfiscation } from '../types';

type Relation = { identificador: number; descripcion: string };
type Response = Omit<WeaponConfiscation, 'identificador' | 'decomiso' | 'arma'> & {
    identificador: number;
    decomiso: { identificador: number };
    arma: Relation;
};
const toEntity = ({ decomiso, arma, ...rest }: Response): WeaponConfiscation => ({
    decomiso: readId(decomiso.identificador), arma: readId(arma.identificador), arma_nombre: arma.descripcion,

    ...rest, identificador: readId(rest.identificador),
});
export const weaponConfiscationService = {
    async list(parent: number, { page, sortBy, orderType, per_page, search_by, valueSearch }: ListParams, signal?: AbortSignal) {
        const sort = sortBy === 'id' ? 'identificador' : sortBy;
        const { data: { data, ...tableOptions } } = await api.get<TableOptions & { data: Response[] }>(
            `/weaponConfiscation/${readId(parent)}/confiscation?page=${page}&sort_by=${sort}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal });
        return { rows: data.map(toEntity), tableOptions };
    },
    async create(values: WeaponConfiscation, signal?: AbortSignal) {
        const { data } = await api.post<Response>('/weaponConfiscation', values,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async update(values: WeaponConfiscation & { identificador: number }, signal?: AbortSignal) {
        const payload = new FormData();
        payload.append('cantidad', values.cantidad.toString());

        payload.append('decomiso', values.decomiso.toString());
        payload.append('arma', values.arma.toString());

        if (values.foto instanceof File) payload.append('foto', values.foto);
        payload.append('_method', 'PUT');
        const { data } = await api.post<Response>(`/weaponConfiscation/${readId(values.identificador)}`, payload,
            { signal, headers: { 'Content-Type': 'multipart/form-data' } });
        return toEntity(data);
    },
    async remove(id: number, signal?: AbortSignal): Promise<void> {
        await api.delete(`/weaponConfiscation/${readId(id)}`, { signal });
    },
};
