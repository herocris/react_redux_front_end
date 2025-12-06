import { AddFloatingButton, AlertDialog, EntityList, } from '../../../components';
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
          <AlertDialog
            title='Borrar'
            dialogMessage="Deseas borrar la munición?"
            DeleteEntity={DeleteAmmunition}
            handleOpen={handleOpenDialog} />
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
