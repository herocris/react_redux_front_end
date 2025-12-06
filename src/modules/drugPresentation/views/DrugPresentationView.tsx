import { AddFloatingButton, AlertDialog, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { DrugPresentationFormModal } from '../components';
import { useDrugPresentationView } from '../hooks';

export const DrugPresentationView = () => {
  const {
    DeleteDrugPresentation,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdDrugPresentation,
    tableOptions,
    openDialog,
    open,
    drugPresentations,
    activeDrugPresentation,
    onSaveOrUptdate,
    errorMessage
  } = useDrugPresentationView()
  return (
    <>
      <GrapLayout>
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdDrugPresentation}
          EntityCollection={drugPresentations}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
        {open &&
          <DrugPresentationFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeDrugPresentation={activeDrugPresentation}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <AlertDialog
            title='Borrar'
            dialogMessage="Deseas borrar la munición?"
            DeleteEntity={DeleteDrugPresentation}
            handleOpen={handleOpenDialog} />
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
