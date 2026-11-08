import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import { UserError } from '../components/UserError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { UserFormModal } from '../components/UserFormModal';
import { useUserView } from '../hooks/useUserView';

export const UserView = () => {
  const {
    DeleteUser,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdUser,
    tableOptions,
    openDialog,
    open,
    users,
    activeUser,
    permisos,
    permissionOptionsQuery,
    roles,
    onSaveOrUptdate,
    errorMessage
  } = useUserView()
  return (
    <>
      <GrapLayout>
        {!open && <PermissionOptionsStatus pending={permissionOptionsQuery.isPending}
          error={permissionOptionsQuery.error} retry={() => { void permissionOptionsQuery.refetch(); }} />}
        {!open && !openDialog && <UserError message={errorMessage} />}
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdUser}
          EntityCollection={users}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
        {open &&
          <UserFormModal
            handleOpen={handleOpen}
            loading={loading}
            permisos={permisos}
            permissionOptionsStatus={{ pending: permissionOptionsQuery.isPending,
              error: permissionOptionsQuery.error, retry: () => { void permissionOptionsQuery.refetch(); } }}
            roles={roles}
            activeUser={activeUser}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-user-title" aria-describedby="delete-user-description">
            <DialogTitle id="delete-user-title">Borrar usuario</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-user-description">¿Deseas borrar el usuario?</DialogContentText>
              <UserError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeleteUser} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
