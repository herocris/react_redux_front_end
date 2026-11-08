import { useCallback, useState } from 'react';
import { clearActiveDrugPresentation, onClearErrorMessage, onSetActiveDrugPresentation} from "../slices";
import { startDeleteDrugPresentation, startLoadingDrugPresentations, startSaveDrugPresentation, startUpdateDrugPresentation } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import type { DrugPresentation } from '../types';

export const useDrugPresentationView = () => {
  const { activeDrugPresentation, drugPresentations, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.drugPresentation);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActiveDrugPresentation())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActiveDrugPresentation());
    setOpenDialog(value => !value);
  }

  const setIdDrugPresentation = (id: string) => {
    const drugPresentation = drugPresentations.find((row: DrugPresentation) => row.id === id);
    if (drugPresentation) dispatch(onSetActiveDrugPresentation(drugPresentation))
  };

  const DeleteDrugPresentation = async () => {
    if (activeDrugPresentation.id === undefined) return;
    try {
      await dispatch(startDeleteDrugPresentation({ ...activeDrugPresentation, id: activeDrugPresentation.id }));
      setOpenDialog(false);
    } catch {
      // The thunk publishes the error; keep the dialog open for a retry.
    }
  };

  const onSaveOrUptdate = async (drugPresentation: DrugPresentation) => {
    if (activeDrugPresentation.id === undefined) {
      await dispatch(startSaveDrugPresentation(drugPresentation));
    } else {
      await dispatch(startUpdateDrugPresentation({ ...drugPresentation, id: activeDrugPresentation.id }));
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
    return dispatch(startLoadingDrugPresentations(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
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
    drugPresentations,
    activeDrugPresentation,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdDrugPresentation,
    DeleteDrugPresentation,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
