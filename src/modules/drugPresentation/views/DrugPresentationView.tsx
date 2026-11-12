import { useAccess } from '../../auth/hooks/useAccess';
import { ApiRequestError } from '../../../components/ApiRequestError';
import { logoColumn } from '../../../components/logoColumn';
import type { GridColDef } from '@mui/x-data-grid';
import type { DrugPresentationEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DrugPresentationError } from '../components/DrugPresentationError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { DrugPresentationFormModal } from '../components';
import { useDrugPresentationView } from '../hooks';

const columns: GridColDef<DrugPresentationEntity>[] = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'descripcion', headerName: 'Descripción', flex: 1 },
  logoColumn(),
];

export const DrugPresentationView = () => {
  const access = useAccess('drugPresentation');
  const {
    DeleteDrugPresentation,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listFailure, retryList, rowCount, onEdit, onDelete,
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
        <ApiRequestError error={listFailure} retry={retryList} busy={listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={drugPresentations} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={access.update ? onEdit : undefined} onDelete={access.delete ? onDelete : undefined} />
        {open && (activeDrugPresentation?.id === undefined ? access.create : access.update) &&
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
        {access.create && <AddFloatingButton handleOpen={handleOpen} />}
      </GrapLayout>
    </>
  )
}
