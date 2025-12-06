

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
            dialogMessage="Deseas borrar el usuario?"
            DeleteEntity={DeleteUser}
            handleOpen={handleOpenDialog} />
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
