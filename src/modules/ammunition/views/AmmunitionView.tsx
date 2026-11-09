import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { AmmunitionError } from '../components/AmmunitionError';

import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { AmmunitionFormModal } from '../components';
import { useAmmunitionView } from '../hooks';

export const AmmunitionView = () => {
  const {
    DeleteAmmunition,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdAmmunition,
    tableOptions,
    openDialog,
    open,
    ammunitions,
    activeAmmunition,
    onSaveOrUptdate,
    errorMessage
  } = useAmmunitionView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <AmmunitionError message={errorMessage} />}
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdAmmunition}
          EntityCollection={ammunitions}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
        {open &&
          <AmmunitionFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeAmmunition={activeAmmunition}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar munición" message="¿Deseas borrar la munición?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteAmmunition}>
            <AmmunitionError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
