import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PermissionOptionsStatus } from '../../permission/components/PermissionOptionsStatus';
import { RoleError } from '../components/RoleError';

import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
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
