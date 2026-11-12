import { useAccess } from '../../auth/hooks/useAccess';
import { ApiRequestError } from '../../../components/ApiRequestError';
import { logoColumn } from '../../../components/logoColumn';
import type { GridColDef } from '@mui/x-data-grid';
import type { DrugEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DrugError } from '../components/DrugError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { DrugFormModal } from '../components';
import { useDrugView } from '../hooks';

const columns: GridColDef<DrugEntity>[] = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'descripcion', headerName: 'Descripción', flex: 1 },
  logoColumn(),
];

export const DrugView = () => {
  const access = useAccess('drug');
  const {
    DeleteDrug,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listFailure, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
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
        <ApiRequestError error={listFailure} retry={retryList} busy={listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={drugs} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={access.update ? onEdit : undefined} onDelete={access.delete ? onDelete : undefined} />
        {open && (activeDrug?.id === undefined ? access.create : access.update) &&
          <DrugFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeDrug={activeDrug}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar droga" message="¿Deseas borrar la droga?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteDrug}>
            <DrugError message={errorMessage} />
          </ConfirmDialog>
        }
        {access.create && <AddFloatingButton handleOpen={handleOpen} />}
      </GrapLayout>
    </>
  )
}
