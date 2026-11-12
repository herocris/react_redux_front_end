import { ApiRequestError } from '../../../components/ApiRequestError';
import type { GridColDef } from '@mui/x-data-grid';
import type { RoleEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import { RoleError } from '../components/RoleError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { RoleFormModal } from '../components/RoleFormModal';
import { useRoleView } from '../hooks/useRoleView';

const columns: GridColDef<RoleEntity>[] = [
  { field: 'id', headerName: 'id', flex: 1 },
  { field: 'nombre', headerName: 'nombre', flex: 1 }
];

export const RoleView = () => {
  const {
    DeleteRole,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listFailure, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
    openDialog,
    open,
    permisos,
    permissionOptionsQuery,
    roles,
    activeRole,
    onSaveOrUptdate,
    errorMessage
  } = useRoleView()
  return (
    <>
      <GrapLayout>
        {!open && <PermissionOptionsStatus pending={permissionOptionsQuery.isPending}
          error={permissionOptionsQuery.error} retry={() => { void permissionOptionsQuery.refetch(); }} />}
        {!open && !openDialog && <RoleError message={errorMessage} />}
        <ApiRequestError error={listFailure} retry={retryList} busy={listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={roles} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
          <RoleFormModal
            handleOpen={handleOpen}
            permisos={permisos}
            permissionOptionsStatus={{ pending: permissionOptionsQuery.isPending,
              error: permissionOptionsQuery.error, retry: () => { void permissionOptionsQuery.refetch(); } }}
            loading={loading}
            activeRole={activeRole}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar rol" message="¿Deseas borrar el rol?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteRole}>
            <RoleError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
