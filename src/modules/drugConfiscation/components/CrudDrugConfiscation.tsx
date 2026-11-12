import { useAccess } from '../../auth/hooks/useAccess';
import { Alert, Box, Button, CircularProgress, TablePagination } from '@mui/material';
import { useDrugConfiscation } from '../hooks';
import { DrugConfiscationForm } from './DrugConfiscationForm';
import { ListSubConfiscation } from '../../confiscation/components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export const CrudDrugConfiscation = () => {
    const access = useAccess('drugConfiscation');
    const view = useDrugConfiscation();
    return <Box sx={{ width: '100%' }}>
        {view.listLoading && <CircularProgress aria-label="Cargando subdecomisos" size={24} />}
        {view.listError && <Alert severity="error">{view.listError}
            <Button disabled={view.listLoading} onClick={view.retryList}>Reintentar listado</Button></Alert>}
        {view.openDrugConfiscationForm && (view.activeDrugConfiscation.identificador ? access.update : access.create) ? <>
            <DrugConfiscationForm optionsStatus={view.optionsStatus}
                activeDrugConfiscation={view.activeDrugConfiscation} drugCollection={view.drugCollection}
                drugPresentationCollection={view.drugPresentationCollection}
                onSaveOrUptdate={view.onSaveOrUptdateDrugConfiscation} handleOpen={view.handleOpenDrugConfiscationForm}
                handleOpenDialog={view.handleOpenDialogDrugConfiscation} busy={view.loading} />

        </> : <>
            <ListSubConfiscation onCreate={access.create ? () => { view.setIdDrugConfiscation(0); view.handleOpenDrugConfiscationForm(true); } : undefined}
                onEdit={access.update ? id => { view.setIdDrugConfiscation(id); view.handleOpenDrugConfiscationForm(true); } : undefined}
                onDelete={access.delete ? id => { view.setIdDrugConfiscation(id); view.handleOpenDialogDrugConfiscation(); } : undefined} list={view.drugConfiscations}
                disabled={view.listUnavailable} />
            <TablePagination component="div" count={view.total} page={view.page} rowsPerPage={view.pageSize}
                onPageChange={(_, page) => view.onPageChange(page)}
                onRowsPerPageChange={event => view.onPageSizeChange(Number(event.target.value))}
                rowsPerPageOptions={[5, 10, 25]} />
        </>}
            {view.openDialogDrugConfiscation && <ConfirmDialog title="Borrar" message="Deseas borrar el decomiso?"
                confirmLabel="Ok" busy={view.loading} onCancel={view.handleOpenDialogDrugConfiscation} onConfirm={view.onDeleteDrugConfiscation}>
                {view.errorMessage && <Alert severity="error">{view.errorMessage}</Alert>}
            </ConfirmDialog>}
    </Box>;
};
