import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { getApiErrorMessage } from '../../../api/apiErrors';
import type { Ammunition, AmmunitionEntity } from '../types';
import { ammunitionListOptions, ammunitionMutationOptions } from '../queries/ammunitionQueries';

export const useAmmunitionView = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [activeAmmunition, setActiveAmmunition] = useState<Ammunition>({ descripcion: '', logo: '' });
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const client = useQueryClient();
  const listOptions = ammunitionListOptions({
    page: paginationModel.page + 1, per_page: paginationModel.pageSize,
    sortBy: sortModel[0]?.field || 'id', orderType: sortModel[0]?.sort || 'asc',
    search_by: filterModel.items[0]?.field || '', valueSearch: String(filterModel.items[0]?.value ?? ''),
  });
  const query = useQuery({ ...listOptions, placeholderData: keepPreviousData });
  // Retain only the cache key. Query remains the owner of the previous result.
  const lastSuccessfulKey = useRef(listOptions.queryKey);
  useEffect(() => {
    if (query.isSuccess && !query.isPlaceholderData) lastSuccessfulKey.current = listOptions.queryKey;
  }, [query.isSuccess, query.isPlaceholderData, listOptions.queryKey]);
  const data = query.data ?? client.getQueryData(lastSuccessfulKey.current);
  const mutation = useMutation(ammunitionMutationOptions(client, () => {
    setOpen(false);
    setOpenDialog(false);
    setActiveAmmunition({ descripcion: '', logo: '' });
  }));
  const loading = mutation.isPending;

  // Reconcile server-confirmed empty pages, never placeholder rows or pending totals.
  useEffect(() => {
    if (!query.data || query.isPlaceholderData || query.isFetching || query.isError ||
        query.data.rows.length > 0) return;
    const lastPage = Math.max(0, Math.ceil(query.data.tableOptions.total / paginationModel.pageSize) - 1);
    if (paginationModel.page > lastPage) setPaginationModel(model => ({ ...model, page: lastPage }));
  }, [query.data, query.isPlaceholderData, query.isFetching, query.isError, paginationModel]);

  const handleOpen = (value: boolean) => {
    if (loading) return;
    mutation.reset();
    setActiveAmmunition({ descripcion: '', logo: '' });
    setOpen(value);
  };
  const handleOpenDialog = () => {
    if (loading) return;
    mutation.reset();
    setActiveAmmunition({ descripcion: '', logo: '' });
    setOpenDialog(false);
  };
  const select = (row: AmmunitionEntity, action: 'edit' | 'delete') => {
    if (loading || query.isPlaceholderData || !query.data) return;
    mutation.reset();
    setActiveAmmunition(row);
    if (action === 'edit') setOpen(true);
    else setOpenDialog(true);
  };
  const DeleteAmmunition = async () => {
    if (loading || activeAmmunition.id === undefined) return;
    try { await mutation.mutateAsync({ type: 'delete', id: activeAmmunition.id }); }
    catch { /* Mutation owns the error; keep selection and dialog for retry. */ }
  };
  const onSaveOrUptdate = async (values: Ammunition) => {
    if (loading) return;
    await mutation.mutateAsync(activeAmmunition.id === undefined
      ? { type: 'create', values }
      : { type: 'update', values: { ...values, id: activeAmmunition.id } });
  };
  return {
    ammunitions: data?.rows ?? [], rowCount: data?.tableOptions.total ?? 0,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange: setPaginationModel,
    onSortModelChange: (model: GridSortModel) => {
      setSortModel(model); setPaginationModel(value => ({ ...value, page: 0 }));
    },
    onFilterModelChange: (model: GridFilterModel) => {
      setFilterModel(model); setPaginationModel(value => ({ ...value, page: 0 }));
    },
    listFailure: query.isError ? query.error : null,
    listLoading: query.isFetching, listError: query.isError ? getApiErrorMessage(query.error) : '',
    retryList: () => { void query.refetch(); },
    loading, open, openDialog, activeAmmunition,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : '',
    handleOpen, handleOpenDialog, DeleteAmmunition, onSaveOrUptdate,
    onEdit: (row: AmmunitionEntity) => select(row, 'edit'),
    onDelete: (row: AmmunitionEntity) => select(row, 'delete'),
  };
};
