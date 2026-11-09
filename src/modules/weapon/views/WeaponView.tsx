import { logoColumn } from '../../../components/logoColumn';
import { Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { WeaponEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { WeaponError } from '../components/WeaponError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { WeaponFormModal } from '../components';
import { useWeaponView } from '../hooks';

const columns: GridColDef<WeaponEntity>[] = [
  { field: 'id', headerName: 'id', flex: 1 },
  { field: 'descripcion', headerName: 'descripcion', flex: 1 },
  logoColumn(),
];

export const WeaponView = () => {
  const {
    DeleteWeapon,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listError, retryList, rowCount, onEdit, onDelete,
    handleOpen,
    handleOpenDialog,
    loading,
    openDialog,
    open,
    weapons,
    activeWeapon,
    onSaveOrUptdate,
    errorMessage
  } = useWeaponView()
  return (
    <>
      <GrapLayout>
        {!open && !openDialog && <WeaponError message={errorMessage} />}
        <WeaponError message={listError} />
        {listError && <Button onClick={retryList} disabled={listLoading}>Reintentar listado</Button>}
        <EntityList rows={weapons} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={onEdit} onDelete={onDelete} />
        {open &&
          <WeaponFormModal
            handleOpen={handleOpen}
            loading={loading}
            activeWeapon={activeWeapon}
            onSaveOrUptdate={onSaveOrUptdate}
            errorMessage={errorMessage} />
        }
        {openDialog &&
          <ConfirmDialog title="Borrar arma" message="¿Deseas borrar el arma?" busy={loading}
            onCancel={handleOpenDialog} onConfirm={DeleteWeapon}>
            <WeaponError message={errorMessage} />
          </ConfirmDialog>
        }
        <AddFloatingButton handleOpen={handleOpen} />
      </GrapLayout>
    </>
  )
}
