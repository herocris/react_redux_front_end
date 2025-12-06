import { useCallback, useMemo, useState } from "react";
import { startDeleteAmmunition, startLoadingAmmunitions, startSaveAmmunition, startUpdateAmmunition } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { Ammunition } from "../";
import { clearActiveAmmunition, onSetActiveAmmunition } from "../slices";

export const useAmmunitionView = () => {
  const { activeAmmunition, ammunitions, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.ammunition);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const handleOpen = useCallback((valOp: boolean) => {
    if (open) dispatch(clearActiveAmmunition())
    setOpen(valOp);
  },[open])

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = useCallback(() => {
    setOpenDialog(!openDialog);
  },[openDialog])

  const setIdAmmunition = useCallback((id: string) => {
    const ammunition = ammunitions.find((row: Ammunition) => row.id === id);
    dispatch(onSetActiveAmmunition(ammunition as Ammunition))
  },[ammunitions]);

  const DeleteAmmunition = useCallback(async () => {
    await dispatch(startDeleteAmmunition(activeAmmunition));
    setOpenDialog(!openDialog);
  },[activeAmmunition])

  const onSaveOrUptdate = useCallback(async (ammunition: Ammunition) => {
    console.log(ammunition);
    if (activeAmmunition.id === undefined) {
      await dispatch(startSaveAmmunition(ammunition)).then(() => {
        handleOpen(false)
      })
    } else {
      await dispatch(startUpdateAmmunition({ ...ammunition, id: activeAmmunition.id })).then(() => {
        handleOpen(false)
      })
    }
  },[activeAmmunition])

  const LoadingEntities = useCallback((
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    dispatch(startLoadingAmmunitions(page, sortBy, sortType, pageSize, filterField, filterValue))
  },[ammunitions])


  const columnsTable = useMemo(() => ['id', 'descripcion', 'logo'], []);

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
