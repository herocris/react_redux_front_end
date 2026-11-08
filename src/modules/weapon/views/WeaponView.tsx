import { WeaponError } from '../components/WeaponError';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AddFloatingButton, EntityList, } from '../../../components';
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
          <Dialog open onClose={() => { if (!loading) handleOpenDialog(); }} aria-labelledby="delete-weapon-title" aria-describedby="delete-weapon-description">
            <DialogTitle id="delete-weapon-title">Borrar arma</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-weapon-description">¿Deseas borrar el arma?</DialogContentText>
              <WeaponError message={errorMessage} />
            </DialogContent>
            <DialogActions>
              <Button disabled={loading} onClick={handleOpenDialog}>Cancelar</Button>
              <Button loading={loading} onClick={DeleteWeapon} color="error">Borrar</Button>
            </DialogActions>
          </Dialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
