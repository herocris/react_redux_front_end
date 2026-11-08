import { RoleError } from '../components/RoleError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { RoleFormModal } from '../components/RoleFormModal';
import { useRoleView } from '../hooks/useRoleView';

export const RoleView = () => {
  const {
    DeleteRole,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdRole,
    tableOptions,
    openDialog,
    open,
    permisos,
    roles,
    activeRole,
    onSaveOrUptdate,
    errorMessage
  } = useRoleView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <RoleError message={errorMessage} />}
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdRole}
          EntityCollection={roles}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
        {open &&
          <RoleFormModal
            handleOpen={handleOpen}
            permisos={permisos}
            loading={loading}
            activeRole={activeRole}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-role-title" aria-describedby="delete-role-description">
            <DialogTitle id="delete-role-title">Borrar rol</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-role-description">¿Deseas borrar el rol?</DialogContentText>
              <RoleError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeleteRole} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
