import { Alert, useMediaQuery } from '@mui/material';
import { ApiRequestError } from '../../../components/ApiRequestError';
import type { GridColDef } from '@mui/x-data-grid';
import { AddFloatingButton, EntityList } from '../../../components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useConfiscationView } from '../hooks';
import type { ConfiscationEntity } from '../services/confiscationService';

const columns: GridColDef<ConfiscationEntity>[] = ['id', 'fecha', 'observacion', 'direccion', 'departamento', 'municipalidad']
    .map(field => ({ field, headerName: field, flex: 1 }));
export const ConfiscationsView = () => {
    const view = useConfiscationView();
    const matches = useMediaQuery('(min-width:600px)');
    return <GrapLayout>
        <ApiRequestError error={view.listFailure} retry={view.retryList} busy={view.listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={view.confiscations} columns={matches ? columns : columns.slice(1, 3)}
            rowCount={view.rowCount} loading={view.listLoading} paginationModel={view.paginationModel}
            sortModel={view.sortModel} filterModel={view.filterModel}
            onPaginationModelChange={view.onPaginationModelChange} onSortModelChange={view.onSortModelChange}
            onFilterModelChange={view.onFilterModelChange} onEdit={view.onEdit} onDelete={view.onDelete} />
        {view.openDialog && <ConfirmDialog title="Borrar" message="Deseas borrar el decomiso?"
            confirmLabel="Ok" busy={view.loading} onCancel={view.handleOpenDialog} onConfirm={view.DeleteConfiscation}>
            {view.errorMessage && <Alert severity="error">{view.errorMessage}</Alert>}
        </ConfirmDialog>}
        <AddFloatingButton handleOpen={view.newConfication} />
    </GrapLayout>;
};
