import type { GridColDef } from '@mui/x-data-grid';
import type { Activity } from '../types';
import { EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { useActivityView } from '../hooks';
import { Button } from '@mui/material';
import { ActivityError } from '../components/ActivityError';

const columns: GridColDef<Activity>[] = ['id', 'tipo_de_evento', 'descripcion', 'id_usuario', 'usuario', 'cambios', 'fecha'].map(field => ({ field, headerName: field, flex: 1 }));

export const ActivityView = () => {
  const {
    activities,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listError, retryList, rowCount,
  } = useActivityView()
  return (
    <>
      <GrapLayout>
        <ActivityError message={listError} />
        {listError && <Button disabled={listLoading} onClick={retryList}>Reintentar carga</Button>}
        <EntityList rows={activities} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange} />
      </GrapLayout>
    </>
  )
}
