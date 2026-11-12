import { useAccess } from '../../auth/hooks/useAccess';
import { Alert, Box, Button, CircularProgress, TablePagination } from '@mui/material';
import { useAmmunitionConfiscation } from '../hooks';
import { AmmunitionConfiscationForm } from './AmmunitionConfiscationForm';
import { ListSubConfiscation } from '../../confiscation/components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export const CrudAmmunitionConfiscation = () => {
    const access = useAccess('ammunitionConfiscation');
    const view = useAmmunitionConfiscation();
    return <Box sx={{ width: '100%' }}>
        {view.listLoading && <CircularProgress aria-label="Cargando subdecomisos" size={24} />}
        {view.listError && <Alert severity="error">{view.listError}
            <Button disabled={view.listLoading} onClick={view.retryList}>Reintentar listado</Button></Alert>}
        {view.openAmmunitionConfiscationForm && (view.activeAmmunitionConfiscation.identificador ? access.update : access.create) ? <>
            <AmmunitionConfiscationForm optionsStatus={view.optionsStatus}
                activeAmmunitionConfiscation={view.activeAmmunitionConfiscation} ammunitionCollection={view.ammunitionCollection}

                onSaveOrUptdate={view.onSaveOrUptdateAmmunitionConfiscation} handleOpen={view.handleOpenAmmunitionConfiscationForm}
                handleOpenDialog={view.handleOpenDialogAmmunitionConfiscation} busy={view.loading} />

        </> : <>
            <ListSubConfiscation onCreate={access.create ? () => { view.setIdAmmunitionConfiscation(0); view.handleOpenAmmunitionConfiscationForm(true); } : undefined}
                onEdit={access.update ? id => { view.setIdAmmunitionConfiscation(id); view.handleOpenAmmunitionConfiscationForm(true); } : undefined}
                onDelete={access.delete ? id => { view.setIdAmmunitionConfiscation(id); view.handleOpenDialogAmmunitionConfiscation(); } : undefined} list={view.ammunitionConfiscations}
                disabled={view.listUnavailable} />
            <TablePagination component="div" count={view.total} page={view.page} rowsPerPage={view.pageSize}
                onPageChange={(_, page) => view.onPageChange(page)}
                onRowsPerPageChange={event => view.onPageSizeChange(Number(event.target.value))}
                rowsPerPageOptions={[5, 10, 25]} />
        </>}
            {view.openDialogAmmunitionConfiscation && <ConfirmDialog title="Borrar" message="Deseas borrar el decomiso?"
                confirmLabel="Ok" busy={view.loading} onCancel={view.handleOpenDialogAmmunitionConfiscation} onConfirm={view.onDeleteAmmunitionConfiscation}>
                {view.errorMessage && <Alert severity="error">{view.errorMessage}</Alert>}
            </ConfirmDialog>}
    </Box>;
};
