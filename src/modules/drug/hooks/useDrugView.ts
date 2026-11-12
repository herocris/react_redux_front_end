import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { getApiErrorMessage } from '../../../api/apiErrors';
import type { Drug, DrugEntity } from '../types';
import { drugListOptions, drugMutationOptions } from '../queries/drugQueries';

export const useDrugView = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [activeDrug, setActiveDrug] = useState<Drug>({ descripcion: '', logo: '' });
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const client = useQueryClient();
  const listOptions = drugListOptions({
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
  const mutation = useMutation(drugMutationOptions(client, () => {
    setOpen(false);
    setOpenDialog(false);
    setActiveDrug({ descripcion: '', logo: '' });
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
    setActiveDrug({ descripcion: '', logo: '' });
    setOpen(value);
  };
  const handleOpenDialog = () => {
    if (loading) return;
    mutation.reset();
    setActiveDrug({ descripcion: '', logo: '' });
    setOpenDialog(false);
  };
  const select = (row: DrugEntity, action: 'edit' | 'delete') => {
    if (loading || query.isPlaceholderData || !query.data) return;
    mutation.reset();
    setActiveDrug(row);
    if (action === 'edit') setOpen(true);
    else setOpenDialog(true);
  };
  const DeleteDrug = async () => {
    if (loading || activeDrug.id === undefined) return;
    try { await mutation.mutateAsync({ type: 'delete', id: activeDrug.id }); }
    catch { /* Mutation owns the error; keep selection and dialog for retry. */ }
  };
  const onSaveOrUptdate = async (values: Drug) => {
    if (loading) return;
    await mutation.mutateAsync(activeDrug.id === undefined
      ? { type: 'create', values }
      : { type: 'update', values: { ...values, id: activeDrug.id } });
  };
  return {
    drugs: data?.rows ?? [], rowCount: data?.tableOptions.total ?? 0,
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
    loading, open, openDialog, activeDrug,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : '',
    handleOpen, handleOpenDialog, DeleteDrug, onSaveOrUptdate,
    onEdit: (row: DrugEntity) => select(row, 'edit'),
    onDelete: (row: DrugEntity) => select(row, 'delete'),
  };
};
