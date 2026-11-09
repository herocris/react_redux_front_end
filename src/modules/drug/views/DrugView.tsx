import { logoColumn } from '../../../components/logoColumn';
import { Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { DrugEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DrugError } from '../components/DrugError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { DrugFormModal } from '../components';
import { useDrugView } from '../hooks';

const columns: GridColDef<DrugEntity>[] = [
  { field: 'id', headerName: 'id', flex: 1 },
  { field: 'descripcion', headerName: 'descripcion', flex: 1 },
  logoColumn(),
];

export const DrugView = () => {
  const {
    DeleteDrug,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listError, retryList, rowCount, onEdit, onDelete,
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
        <DrugError message={listError} />
        {listError && <Button onClick={retryList} disabled={listLoading}>Reintentar listado</Button>}
        <EntityList rows={drugs} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
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
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
