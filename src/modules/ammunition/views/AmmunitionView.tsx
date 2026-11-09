import { logoColumn } from '../../../components/logoColumn';
import { Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { AmmunitionEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { AmmunitionError } from '../components/AmmunitionError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { AmmunitionFormModal } from '../components';
import { useAmmunitionView } from '../hooks';

const columns: GridColDef<AmmunitionEntity>[] = [
  { field: 'id', headerName: 'id', flex: 1 },
  { field: 'descripcion', headerName: 'descripcion', flex: 1 },
  logoColumn(),
];

export const AmmunitionView = () => {
  const {
    DeleteAmmunition,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listError, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
    openDialog,
    open,
    ammunitions,
    activeAmmunition,
    onSaveOrUptdate,
    errorMessage
  } = useAmmunitionView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <AmmunitionError message={errorMessage} />}
        <AmmunitionError message={listError} />
        {listError && <Button onClick={retryList} disabled={listLoading}>Reintentar listado</Button>}
        <EntityList rows={ammunitions} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
          <AmmunitionFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeAmmunition={activeAmmunition}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar munición" message="¿Deseas borrar la munición?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteAmmunition}>
            <AmmunitionError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
