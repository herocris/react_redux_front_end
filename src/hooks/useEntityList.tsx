import { useEffect, useState } from 'react';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import type { LoadEntities, TableOptions } from '../shared/interfaces/sharedInterfaces';

// Temporary loading protocol for Redux consumers. New consumers own their models.
export const useEntityList = (LoadingEntities: LoadEntities, tableOptions: TableOptions) => {
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
    const [sortModel, setSortModel] = useState<GridSortModel>(() => [{
        field: tableOptions.orderBy,
        sort: tableOptions.order === 'desc' ? 'desc' : 'asc',
    }]);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(() => ({
        page: tableOptions.current_page - 1, pageSize: tableOptions.per_page,
    }));
    const { page, pageSize } = paginationModel;
    const sortField = sortModel[0]?.field || 'identificador';
    const sortDirection = sortModel[0]?.sort || 'asc';
    const filterField = filterModel.items[0]?.field || '';
    const filterValue = String(filterModel.items[0]?.value ?? '');

    useEffect(() => {
        const controller = new AbortController();
        void LoadingEntities(page + 1, sortField, sortDirection, pageSize, filterField, filterValue, controller.signal);
        return () => controller.abort();
    }, [LoadingEntities, page, pageSize, sortField, sortDirection, filterField, filterValue]);

    return { paginationModel, sortModel, filterModel,
        onPaginationModelChange: setPaginationModel,
        onSortModelChange: setSortModel,
        onFilterModelChange: setFilterModel };
};
