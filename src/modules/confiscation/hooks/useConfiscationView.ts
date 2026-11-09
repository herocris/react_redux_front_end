import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { getApiErrorText } from '../../../api/apiErrors';
import type { ConfiscationEntity } from '../services/confiscationService';
import { useNavigate } from 'react-router';
import { confiscationListOptions, confiscationMutationOptions } from '../queries/confiscationQueries';

export const useConfiscationView = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const navigate = useNavigate();
  const [activeConfiscation, setActiveConfiscation] = useState<ConfiscationEntity>();
  const [openDialog, setOpenDialog] = useState(false);
  const client = useQueryClient();
  const listOptions = confiscationListOptions({
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
  const mutation = useMutation(confiscationMutationOptions(client, () => {
    setOpenDialog(false);
    setActiveConfiscation(undefined);
  }));
  const loading = mutation.isPending;

  // Reconcile server-confirmed empty pages, never placeholder rows or pending totals.
  useEffect(() => {
    if (!query.data || query.isPlaceholderData || query.isFetching || query.isError ||
        query.data.rows.length > 0) return;
    const lastPage = Math.max(0, Math.ceil(query.data.tableOptions.total / paginationModel.pageSize) - 1);
    if (paginationModel.page > lastPage) setPaginationModel(model => ({ ...model, page: lastPage }));
  }, [query.data, query.isPlaceholderData, query.isFetching, query.isError, paginationModel]);

  const handleOpenDialog = () => {
    if (loading) return;
    mutation.reset();
    setActiveConfiscation(undefined);
    setOpenDialog(false);
  };
  const select = (row: ConfiscationEntity, action: 'edit' | 'delete') => {
    if (loading || query.isPlaceholderData || !query.data) return;
    mutation.reset();
    setActiveConfiscation(row);
    if (action === 'edit') navigate(`/confiscation/edit/${row.id}`);
    else setOpenDialog(true);
  };
  const DeleteConfiscation = async () => {
    if (loading || activeConfiscation?.id === undefined) return;
    try { await mutation.mutateAsync({ type: 'delete', id: activeConfiscation.id }); }
    catch { /* Mutation owns the error; keep selection and dialog for retry. */ }
  };
  return {
    confiscations: data?.rows ?? [], rowCount: data?.tableOptions.total ?? 0,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange: setPaginationModel,
    onSortModelChange: (model: GridSortModel) => {
      setSortModel(model); setPaginationModel(value => ({ ...value, page: 0 }));
    },
    onFilterModelChange: (model: GridFilterModel) => {
      setFilterModel(model); setPaginationModel(value => ({ ...value, page: 0 }));
    },
    listLoading: query.isFetching, listError: query.isError ? getApiErrorText(query.error) : '',
    retryList: () => { void query.refetch(); },
    loading, openDialog, activeConfiscation,
    errorMessage: mutation.isError ? getApiErrorText(mutation.error) : '',
    handleOpenDialog, DeleteConfiscation,
    newConfication: () => navigate('/confiscation/create'),
    onEdit: (row: ConfiscationEntity) => select(row, 'edit'),
    onDelete: (row: ConfiscationEntity) => select(row, 'delete'),
  };
};
