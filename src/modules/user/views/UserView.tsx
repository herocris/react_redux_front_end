import { ApiRequestError } from '../../../components/ApiRequestError';
import type { GridColDef } from '@mui/x-data-grid';
import type { UserEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import { UserError } from '../components/UserError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { UserFormModal } from '../components/UserFormModal';
import { useUserView } from '../hooks/useUserView';

const columns: GridColDef<UserEntity>[] = [
  { field: 'id', headerName: 'id', flex: 1 },
  { field: 'nombre', headerName: 'nombre', flex: 1 },
  { field: 'correo', headerName: 'correo', flex: 1 }
];

export const UserView = () => {
  const {
    DeleteUser,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listFailure, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
    openDialog,
    open,
    users,
    activeUser,
    permisos,
    permissionOptionsQuery,
    roles, roleOptionsQuery,
    onSaveOrUptdate,
    errorMessage
  } = useUserView()
  return (
    <>
      <GrapLayout>
        {!open && <PermissionOptionsStatus pending={permissionOptionsQuery.isPending}
          error={permissionOptionsQuery.error} retry={() => { void permissionOptionsQuery.refetch(); }} />}
        {!open && !openDialog && <UserError message={errorMessage} />}
        <ApiRequestError error={listFailure} retry={retryList} busy={listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={users} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
          <UserFormModal
            handleOpen={handleOpen}
            loading={loading}
            permisos={permisos}
            permissionOptionsStatus={{ pending: permissionOptionsQuery.isPending,
              error: permissionOptionsQuery.error, retry: () => { void permissionOptionsQuery.refetch(); } }}
            roleOptionsStatus={{ pending: roleOptionsQuery.isPending, error: roleOptionsQuery.error,
              retry: () => { void roleOptionsQuery.refetch(); } }}
            roles={roles}
            activeUser={activeUser}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar usuario" message="¿Deseas borrar el usuario?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteUser}>
            <UserError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
