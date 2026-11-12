import { ApiRequestError } from '../../../components/ApiRequestError';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { GridColDef } from '@mui/x-data-grid';
import type { PermissionEntity } from '../types';
import { PermissionError } from '../components/PermissionError';
import { AddFloatingButton, EntityList } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { PermissionFormModal } from '../components/PermissionFormModal';
import { usePermissionView } from '../hooks/usePermissionView';

const columns: GridColDef<PermissionEntity>[] = [
  { field: 'id', headerName: 'Id', width: 150 },
  { field: 'nombre', headerName: 'Nombre', flex: 1 },
];

export const PermissionView = () => {
  const {
    DeletePermission,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listFailure, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
    openDialog,
    open,
    permissions,
    activePermission,
    onSaveOrUptdate,
    errorMessage
  } = usePermissionView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <PermissionError message={errorMessage} />}
        <ApiRequestError error={listFailure} retry={retryList} busy={listLoading} retryLabel="Reintentar listado" />
        <EntityList
          rows={permissions} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
          <PermissionFormModal
            handleOpen={handleOpen}
            loading={loading}
            activePermission={activePermission}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar permiso" message="¿Deseas borrar el permiso?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeletePermission}>
            <PermissionError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
