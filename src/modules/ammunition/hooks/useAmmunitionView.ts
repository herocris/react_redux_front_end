import { useCallback, useState } from 'react';
import { clearActiveAmmunition, onClearErrorMessage, onSetActiveAmmunition} from "../slices";
import { startDeleteAmmunition, startLoadingAmmunitions, startSaveAmmunition, startUpdateAmmunition } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import type { Ammunition } from '../types';

export const useAmmunitionView = () => {
  const { activeAmmunition, ammunitions, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.ammunition);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActiveAmmunition())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActiveAmmunition());
    setOpenDialog(value => !value);
  }

  const setIdAmmunition = (id: string) => {
    const ammunition = ammunitions.find((row: Ammunition) => row.id === id);
    if (ammunition) dispatch(onSetActiveAmmunition(ammunition))
  };

  const DeleteAmmunition = async () => {
    if (activeAmmunition.id === undefined) return;
    try {
      await dispatch(startDeleteAmmunition({ ...activeAmmunition, id: activeAmmunition.id }));
      setOpenDialog(false);
    } catch {
      // The thunk publishes the error; keep the dialog open for a retry.
    }
  };

  const onSaveOrUptdate = async (ammunition: Ammunition) => {
    if (activeAmmunition.id === undefined) {
      await dispatch(startSaveAmmunition(ammunition));
    } else {
      await dispatch(startUpdateAmmunition({ ...ammunition, id: activeAmmunition.id }));
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
    return dispatch(startLoadingAmmunitions(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
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
    ammunitions,
    activeAmmunition,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdAmmunition,
    DeleteAmmunition,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
