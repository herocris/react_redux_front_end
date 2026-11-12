import type { TableOptions } from '../shared/interfaces/sharedInterfaces';
import type { ListParams } from './catalog';

export type SublistPagination = Pick<TableOptions, 'total' | 'current_page' | 'last_page' | 'per_page'>;
export type SublistResponse<T> = Partial<TableOptions> & { data: T[] };

// P06: Laravel omits pagination when the parent has no children. Only an
// empty first page proves zero; a later empty page cannot establish a total.
export const readSublistPagination = <T>({ data, ...metadata }: SublistResponse<T>, params: ListParams): SublistPagination => {
    const fields = [metadata.total, metadata.current_page, metadata.last_page, metadata.per_page];
    if (data.length === 0 && params.page === 1 && fields.every(value => value === undefined)) {
        return { ...metadata, total: 0, current_page: 1, last_page: 1, per_page: params.per_page };
    }
    const { total, current_page, last_page, per_page } = metadata;
    if (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0 ||
        current_page !== params.page || typeof last_page !== 'number' || !Number.isSafeInteger(last_page) || last_page < 1 ||
        typeof per_page !== 'number' || !Number.isSafeInteger(per_page) || per_page < 1) {
        throw { error: 'No se pudo verificar la paginación de subdecomisos. Reintenta el listado.' };
    }
    return { ...metadata, total, current_page, last_page, per_page };
};
