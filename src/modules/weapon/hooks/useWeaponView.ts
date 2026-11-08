import { useCallback, useState } from 'react';
import { clearActiveWeapon, onClearErrorMessage, onSetActiveWeapon} from "../slices";
import { startDeleteWeapon, startLoadingWeapons, startSaveWeapon, startUpdateWeapon } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import type { Weapon } from '../types';

export const useWeaponView = () => {
  const { activeWeapon, weapons, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.weapon);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActiveWeapon())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActiveWeapon());
    setOpenDialog(value => !value);
  }

  const setIdWeapon = (id: string) => {
    const weapon = weapons.find((row: Weapon) => row.id === id);
    if (weapon) dispatch(onSetActiveWeapon(weapon))
  };

  const DeleteWeapon = async () => {
    if (activeWeapon.id === undefined) return;
    try {
      await dispatch(startDeleteWeapon({ ...activeWeapon, id: activeWeapon.id }));
      setOpenDialog(false);
    } catch {
      // The thunk publishes the error; keep the dialog open for a retry.
    }
  };

  const onSaveOrUptdate = async (weapon: Weapon) => {
    if (activeWeapon.id === undefined) {
      await dispatch(startSaveWeapon(weapon));
    } else {
      await dispatch(startUpdateWeapon({ ...weapon, id: activeWeapon.id }));
    }
    handleOpen(false);
  };

  const LoadingEntities = useCallback((
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string,
    signal?: AbortSignal
  ) => {
    return dispatch(startLoadingWeapons(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
      .catch(() => {
        // The thunk records errors in the module state.
      });
  }, [dispatch]);

  const columnsTable = ['id', 'descripcion', 'logo']

  return {
    tableOptions,
    loading,
    open,
    openDialog,
    columnsTable,
    weapons,
    activeWeapon,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdWeapon,
    DeleteWeapon,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
