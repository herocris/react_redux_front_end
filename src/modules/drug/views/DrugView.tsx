import { DrugError } from '../components/DrugError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, EntityList, } from '../../../components';
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
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-drug-title" aria-describedby="delete-drug-description">
            <DialogTitle id="delete-drug-title">Borrar droga</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-drug-description">¿Deseas borrar la droga?</DialogContentText>
              <DrugError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeleteDrug} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
