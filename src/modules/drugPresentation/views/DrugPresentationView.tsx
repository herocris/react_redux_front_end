import { DrugPresentationError } from '../components/DrugPresentationError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, EntityList, } from '../../../components';
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
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-presentation-title" aria-describedby="delete-presentation-description">
            <DialogTitle id="delete-presentation-title">Borrar presentación</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-presentation-description">¿Deseas borrar la presentación?</DialogContentText>
              <DrugPresentationError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeleteDrugPresentation} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
