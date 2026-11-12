import { useRoleOptions } from '../../rol/queries/useRoleOptions';
import { usePermissionOptions } from '../../permission/queries/usePermissionOptions';
import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { getApiErrorMessage } from '../../../api/apiErrors';
import type { User, UserEntity } from '../types';
import { userListOptions, userMutationOptions } from '../queries/userQueries';

export const useUserView = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [activeUser, setActiveUser] = useState<User>({ nombre: '', correo: '', password: '', permisos: [], roles: [] });
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { permisos, permissionOptionsQuery } = usePermissionOptions();
  const { options: roles, query: roleOptionsQuery } = useRoleOptions();
  const client = useQueryClient();
  const listOptions = userListOptions({
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
  const mutation = useMutation(userMutationOptions(client, () => {
    setOpen(false);
    setOpenDialog(false);
    setActiveUser({ nombre: '', correo: '', password: '', permisos: [], roles: [] });
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
    setActiveUser({ nombre: '', correo: '', password: '', permisos: [], roles: [] });
    setOpen(value);
  };
  const handleOpenDialog = () => {
    if (loading) return;
    mutation.reset();
    setActiveUser({ nombre: '', correo: '', password: '', permisos: [], roles: [] });
    setOpenDialog(false);
  };
  const select = (row: UserEntity, action: 'edit' | 'delete') => {
    if (loading || query.isPlaceholderData || !query.data) return;
    mutation.reset();
    setActiveUser(row);
    if (action === 'edit') setOpen(true);
    else setOpenDialog(true);
  };
  const DeleteUser = async () => {
    if (loading || activeUser.id === undefined) return;
    try { await mutation.mutateAsync({ type: 'delete', id: activeUser.id }); }
    catch { /* Mutation owns the error; keep selection and dialog for retry. */ }
  };
  const onSaveOrUptdate = async (values: User) => {
    if (loading) return;
    await mutation.mutateAsync(activeUser.id === undefined
      ? { type: 'create', values }
      : { type: 'update', values: { ...values, id: activeUser.id } });
  };
  return {
    users: data?.rows ?? [], rowCount: data?.tableOptions.total ?? 0,
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
    roles, roleOptionsQuery,
    permisos, permissionOptionsQuery,
    loading, open, openDialog, activeUser,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : '',
    handleOpen, handleOpenDialog, DeleteUser, onSaveOrUptdate,
    onEdit: (row: UserEntity) => select(row, 'edit'),
    onDelete: (row: UserEntity) => select(row, 'delete'),
  };
};
