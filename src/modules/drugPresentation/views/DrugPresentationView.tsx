import { logoColumn } from '../../../components/logoColumn';
import { Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { DrugPresentationEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DrugPresentationError } from '../components/DrugPresentationError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { DrugPresentationFormModal } from '../components';
import { useDrugPresentationView } from '../hooks';

const columns: GridColDef<DrugPresentationEntity>[] = [
  { field: 'id', headerName: 'id', flex: 1 },
  { field: 'descripcion', headerName: 'descripcion', flex: 1 },
  logoColumn(),
];

export const DrugPresentationView = () => {
  const {
    DeleteDrugPresentation,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listError, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
    openDialog,
    open,
    drugPresentations,
    activeDrugPresentation,
    onSaveOrUptdate,
    errorMessage
  } = useDrugPresentationView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <DrugPresentationError message={errorMessage} />}
        <DrugPresentationError message={listError} />
        {listError && <Button onClick={retryList} disabled={listLoading}>Reintentar listado</Button>}
        <EntityList rows={drugPresentations} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
          <DrugPresentationFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeDrugPresentation={activeDrugPresentation}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar presentación" message="¿Deseas borrar la presentación?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteDrugPresentation}>
            <DrugPresentationError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
