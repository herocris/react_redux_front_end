import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { getApiErrorMessage } from '../../../api/apiErrors';
import type { Permission, PermissionEntity } from '../types';
import { permissionListOptions, permissionMutationOptions } from '../queries/permissionQueries';

export const usePermissionView = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [activePermission, setActivePermission] = useState<Permission>({ nombre: '' });
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const client = useQueryClient();
  const query = useQuery({ ...permissionListOptions({
    page: paginationModel.page + 1, per_page: paginationModel.pageSize,
    sortBy: sortModel[0]?.field || 'id', orderType: sortModel[0]?.sort || 'asc',
    search_by: filterModel.items[0]?.field || '', valueSearch: String(filterModel.items[0]?.value ?? ''),
  }), placeholderData: keepPreviousData });
  const mutation = useMutation(permissionMutationOptions(client, () => {
    setOpen(false);
    setOpenDialog(false);
    setActivePermission({ nombre: '' });
  }));
  const loading = mutation.isPending;

  // Reconcile server-confirmed empty pages, never placeholder rows or pending totals.
  useEffect(() => {
    if (!query.data || query.isPlaceholderData || query.isFetching || query.isError ||
        query.data.permissions.length > 0) return;
    const lastPage = Math.max(0, Math.ceil(query.data.tableOptions.total / paginationModel.pageSize) - 1);
    if (paginationModel.page > lastPage) setPaginationModel(model => ({ ...model, page: lastPage }));
  }, [query.data, query.isPlaceholderData, query.isFetching, query.isError, paginationModel]);

  const handleOpen = (value: boolean) => {
    if (loading) return;
    mutation.reset();
    setActivePermission({ nombre: '' });
    setOpen(value);
  };
  const handleOpenDialog = () => {
    if (loading) return;
    mutation.reset();
    setActivePermission({ nombre: '' });
    setOpenDialog(false);
  };
  const select = (row: PermissionEntity, action: 'edit' | 'delete') => {
    if (loading || query.isPlaceholderData) return;
    mutation.reset();
    setActivePermission(row);
    if (action === 'edit') setOpen(true);
    else setOpenDialog(true);
  };
  const DeletePermission = async () => {
    if (loading || activePermission.id === undefined) return;
    try { await mutation.mutateAsync({ type: 'delete', id: activePermission.id }); }
    catch { /* Mutation owns the error; keep selection and dialog for retry. */ }
  };
  const onSaveOrUptdate = async (values: Permission) => {
    if (loading) return;
    await mutation.mutateAsync(activePermission.id === undefined
      ? { type: 'create', values }
      : { type: 'update', values: { ...values, id: activePermission.id } });
  };
  return {
    permissions: query.data?.permissions ?? [], rowCount: query.data?.tableOptions.total ?? 0,
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
    loading, open, openDialog, activePermission,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : '',
    handleOpen, handleOpenDialog, DeletePermission, onSaveOrUptdate,
    onEdit: (row: PermissionEntity) => select(row, 'edit'),
    onDelete: (row: PermissionEntity) => select(row, 'delete'),
  };
};
