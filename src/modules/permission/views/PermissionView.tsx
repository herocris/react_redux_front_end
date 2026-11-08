import { PermissionError } from '../components/PermissionError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { PermissionFormModal } from '../components/PermissionFormModal';
import { usePermissionView } from '../hooks/usePermissionView';

export const PermissionView = () => {
  const {
    DeletePermission,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdPermission,
    tableOptions,
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
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdPermission}
          EntityCollection={permissions}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
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
