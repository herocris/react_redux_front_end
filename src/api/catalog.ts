import type { TableOptions } from '../shared/interfaces/sharedInterfaces';
export interface ListParams { page: number; per_page: number; sortBy: string; orderType: string; search_by: string; valueSearch: string }
export async function readCatalog<T extends { id: number }>(list: (params: ListParams, signal?: AbortSignal) => Promise<{ rows: T[]; tableOptions: TableOptions }>, signal?: AbortSignal): Promise<T[]> {
    const rows: T[] = [];
    const ids = new Set<number>();
    let expectedTotal: number | undefined;
    let lastPage: number | undefined;
    let page = 1;
    do {
        const result = await list({ page, per_page: 100, sortBy: 'id', orderType: 'asc', search_by: '', valueSearch: '' }, signal);
        const { total, current_page, last_page } = result.tableOptions;
        if (!Number.isInteger(total) || total < 0 || current_page !== page || !Number.isInteger(last_page) || last_page < page ||
            (expectedTotal !== undefined && (total !== expectedTotal || last_page !== lastPage))) throw new Error('No se pudo verificar el catálogo completo.');
        expectedTotal = total;
        lastPage = last_page;
        for (const row of result.rows) {
            if (ids.has(row.id)) throw new Error('El catálogo contiene páginas repetidas.');
            ids.add(row.id); rows.push(row);
        }
        if (page < last_page && result.rows.length === 0) throw new Error('El catálogo está incompleto.');
        page++;
    } while (page <= lastPage!);
    if (rows.length !== expectedTotal) throw new Error('El catálogo está incompleto.');
    return rows;
}
