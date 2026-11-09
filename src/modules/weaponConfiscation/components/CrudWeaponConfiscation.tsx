import { Alert, Box, Button, CircularProgress, TablePagination } from '@mui/material';
import { useWeaponConfiscation } from '../hooks';
import { WeaponConfiscationForm } from './WeaponConfiscationForm';
import { ListSubConfiscation } from '../../confiscation/components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export const CrudWeaponConfiscation = () => {
    const view = useWeaponConfiscation();
    return <Box sx={{ width: '100%' }}>
        {view.listLoading && <CircularProgress aria-label="Cargando subdecomisos" size={24} />}
        {view.listError && <Alert severity="error">{view.listError}
            <Button disabled={view.listLoading} onClick={view.retryList}>Reintentar listado</Button></Alert>}
        {view.openWeaponConfiscationForm ? <>
            <WeaponConfiscationForm optionsStatus={view.optionsStatus}
                activeWeaponConfiscation={view.activeWeaponConfiscation} weaponCollection={view.weaponCollection}

                onSaveOrUptdate={view.onSaveOrUptdateWeaponConfiscation} handleOpen={view.handleOpenWeaponConfiscationForm}
                handleOpenDialog={view.handleOpenDialogWeaponConfiscation} busy={view.loading} />
            {view.openDialogWeaponConfiscation && <ConfirmDialog title="Borrar" message="Deseas borrar el decomiso?"
                confirmLabel="Ok" busy={view.loading} onCancel={view.handleOpenDialogWeaponConfiscation} onConfirm={view.onDeleteWeaponConfiscation}>
                {view.errorMessage && <Alert severity="error">{view.errorMessage}</Alert>}
            </ConfirmDialog>}
        </> : <>
            <ListSubConfiscation setOpen={view.handleOpenWeaponConfiscationForm} list={view.weaponConfiscations}
                disabled={view.listUnavailable} setActiveSubConfiscation={view.setIdWeaponConfiscation} />
            <TablePagination component="div" count={view.total} page={view.page} rowsPerPage={view.pageSize}
                onPageChange={(_, page) => view.onPageChange(page)}
                onRowsPerPageChange={event => view.onPageSizeChange(Number(event.target.value))}
                rowsPerPageOptions={[5, 10, 25]} />
        </>}
    </Box>;
};
