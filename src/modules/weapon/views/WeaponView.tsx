import { useAccess } from '../../auth/hooks/useAccess';
import { ApiRequestError } from '../../../components/ApiRequestError';
import { logoColumn } from '../../../components/logoColumn';
import type { GridColDef } from '@mui/x-data-grid';
import type { WeaponEntity } from '../types';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { WeaponError } from '../components/WeaponError';

import { AddFloatingButton, EntityList, } from '../../../components';
import { GrapLayout } from '../../../shared/layout/GraphLayout';
import { WeaponFormModal } from '../components';
import { useWeaponView } from '../hooks';

const columns: GridColDef<WeaponEntity>[] = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'descripcion', headerName: 'Descripción', flex: 1 },
  logoColumn(),
];

export const WeaponView = () => {
  const access = useAccess('weapon');
  const {
    DeleteWeapon,
    paginationModel, sortModel, filterModel,
    onPaginationModelChange, onSortModelChange, onFilterModelChange,
    listLoading, listFailure, retryList, rowCount, onEdit, onDelete,
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
        <ApiRequestError error={listFailure} retry={retryList} busy={listLoading} retryLabel="Reintentar listado" />
        <EntityList rows={weapons} columns={columns} rowCount={rowCount} loading={listLoading}
          paginationModel={paginationModel} sortModel={sortModel} filterModel={filterModel}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange} onFilterModelChange={onFilterModelChange}
          onEdit={access.update ? onEdit : undefined} onDelete={access.delete ? onDelete : undefined} />
        {open && (activeWeapon?.id === undefined ? access.create : access.update) &&
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
        {access.create && <AddFloatingButton handleOpen={handleOpen} />}
      </GrapLayout>
    </>
  )
}
