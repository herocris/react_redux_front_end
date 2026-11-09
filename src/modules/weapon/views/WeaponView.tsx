import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { WeaponError } from '../components/WeaponError';

import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { WeaponFormModal } from '../components';
import { useWeaponView } from '../hooks';

export const WeaponView = () => {
  const {
    DeleteWeapon,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdWeapon,
    tableOptions,
    openDialog,
    open,
    weapons,
    activeWeapon,
    onSaveOrUptdate,
    errorMessage
  } = useWeaponView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <WeaponError message={errorMessage} />}
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdWeapon}
          EntityCollection={weapons}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
        {open &&
          <WeaponFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeWeapon={activeWeapon}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar arma" message="¿Deseas borrar el arma?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteWeapon}>
            <WeaponError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
