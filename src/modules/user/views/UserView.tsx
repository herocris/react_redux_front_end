import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import { UserError } from '../components/UserError';

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
