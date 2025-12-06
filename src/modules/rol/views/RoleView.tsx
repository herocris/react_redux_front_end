import { AddFloatingButton, AlertDialog, EntityList, } from '../../../components';
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
          <AlertDialog
            title='Borrar'
            dialogMessage="Deseas borrar el rol?"
            DeleteEntity={DeleteRole}
            handleOpen={handleOpenDialog} />
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
