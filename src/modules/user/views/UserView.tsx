import { Alert } from '@mui/material';


import { useUserView } from "../hooks";
import { UserFormModal } from "../components";
import { AddFloatingButton, AlertDialog, EntityList, } from '../../../components';
import { GrapLayout } from "../../../shared/layout/GraphLayout";

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
    users,
    openDialog,
    open,
    permisos,
    roles,
    activeUser,
    onSaveOrUptdate,
    errorMessage
  } = useUserView()
  return (
    <>
      <GrapLayout>
        {!open && typeof errorMessage === 'string' && <Alert severity="error">{errorMessage}</Alert>}
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
            permisos={permisos}
            roles={roles}
            loading={loading}
            activeUser={activeUser}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <AlertDialog
            title='Borrar'
            dialogMessage={typeof errorMessage === 'string' ? `Deseas borrar el usuario? ${errorMessage}` : 'Deseas borrar el usuario?'}
            DeleteEntity={DeleteUser}
            handleOpen={handleOpenDialog} />
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
