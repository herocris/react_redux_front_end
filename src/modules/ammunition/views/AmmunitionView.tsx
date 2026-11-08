import { AmmunitionError } from '../components/AmmunitionError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, EntityList, } from '../../../components';
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
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-ammunition-title" aria-describedby="delete-ammunition-description">
            <DialogTitle id="delete-ammunition-title">Borrar munición</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-ammunition-description">¿Deseas borrar la munición?</DialogContentText>
              <AmmunitionError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeleteAmmunition} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
