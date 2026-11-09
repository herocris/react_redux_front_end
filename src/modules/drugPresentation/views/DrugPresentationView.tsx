import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DrugPresentationError } from '../components/DrugPresentationError';

import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
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
        {!open && !openDialog && <DrugPresentationError message={errorMessage} />}
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
          <ConfirmDialog title="Borrar presentación" message="¿Deseas borrar la presentación?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteDrugPresentation}>
            <DrugPresentationError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
