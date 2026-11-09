import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DrugError } from '../components/DrugError';

import { AddFloatingButton, LegacyEntityList as EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { DrugFormModal } from '../components';
import { useDrugView } from '../hooks';

export const DrugView = () => {
  const {
    DeleteDrug,
    LoadingEntities,
    columnsTable,
    handleOpen,
    handleOpenDialog,
    loading,
    setIdDrug,
    tableOptions,
    openDialog,
    open,
    drugs,
    activeDrug,
    onSaveOrUptdate,
    errorMessage
  } = useDrugView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <DrugError message={errorMessage} />}
        <EntityList
          handleOpen={handleOpen}
          handleOpenDialog={handleOpenDialog}
          LoadingEntities={LoadingEntities}
          setIdEntity={setIdDrug}
          EntityCollection={drugs}
          tableOptions={tableOptions}
          loading={loading}
          columnsTable={columnsTable} />
        {open &&
          <DrugFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeDrug={activeDrug}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar droga" message="¿Deseas borrar la droga?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteDrug}>
            <DrugError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
