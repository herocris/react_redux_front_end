import type { GridColDef } from '@mui/x-data-grid';
import type { PermissionEntity } from '../types';
import { PermissionError } from '../components/PermissionError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
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
    listLoading, listError, retryList, rowCount, onEdit, onDelete,
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
        <PermissionError message={listError} />
        {listError && <Button onClick={retryList} disabled={listLoading}>Reintentar listado</Button>}
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
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-permission-title" aria-describedby="delete-permission-description">
            <DialogTitle id="delete-permission-title">Borrar permiso</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-permission-description">¿Deseas borrar el permiso?</DialogContentText>
              <PermissionError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeletePermission} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
