import { Button } from '@mui/material';
import { Link } from 'react-router';
import { useAccess } from '../../auth/hooks/useAccess';
import { Alert, useMediaQuery } from '@mui/material';
import { ApiRequestError } from '../../../components/ApiRequestError';
import type { GridColDef } from '@mui/x-data-grid';
import { AddFloatingButton, EntityList } from '../../../components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useConfiscationView } from '../hooks';
import type { ConfiscationEntity } from '../services/confiscationService';

const detailColumn: GridColDef<ConfiscationEntity> = {
    field: 'detail', headerName: 'Detalle', sortable: false, filterable: false,
    renderCell: ({ row }) => <Button component={Link} to={`/confiscation/detail/${row.id}`}>Ver detalle</Button>,
};
const columns: GridColDef<ConfiscationEntity>[] = [detailColumn, ...['id', 'fecha', 'observacion', 'direccion', 'departamento', 'municipalidad']
    .map(field => ({ field, headerName: field, flex: 1 }))];
export const ConfiscationsView = () => {
  const access = useAccess('confiscation');
    const view = useConfiscationView();
    const matches = useMediaQuery('(min-width:600px)');
    return <GrapLayout>
        <ApiRequestError error={view.listFailure} retry={view.retryList} busy={view.listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={view.confiscations} columns={matches ? columns : [detailColumn, ...columns.slice(2, 4)]}
            rowCount={view.rowCount} loading={view.listLoading} paginationModel={view.paginationModel}
            sortModel={view.sortModel} filterModel={view.filterModel}
            onPaginationModelChange={view.onPaginationModelChange} onSortModelChange={view.onSortModelChange}
            onFilterModelChange={view.onFilterModelChange} onEdit={access.update ? view.onEdit : undefined} onDelete={access.delete ? view.onDelete : undefined} />
        {view.openDialog && <ConfirmDialog title="Borrar" message="Deseas borrar el decomiso?"
            confirmLabel="Ok" busy={view.loading} onCancel={view.handleOpenDialog} onConfirm={view.DeleteConfiscation}>
            {view.errorMessage && <Alert severity="error">{view.errorMessage}</Alert>}
        </ConfirmDialog>}
        {access.create && <AddFloatingButton handleOpen={view.newConfication} />}
    </GrapLayout>;
};
