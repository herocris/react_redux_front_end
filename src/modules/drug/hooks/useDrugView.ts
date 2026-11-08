import { useCallback, useState } from 'react';
import { clearActiveDrug, onClearErrorMessage, onSetActiveDrug} from "../slices";
import { startDeleteDrug, startLoadingDrugs, startSaveDrug, startUpdateDrug } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import type { Drug } from '../types';

export const useDrugView = () => {
  const { activeDrug, drugs, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.drug);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActiveDrug())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActiveDrug());
    setOpenDialog(value => !value);
  }

  const setIdDrug = (id: string) => {
    const drug = drugs.find((row: Drug) => row.id === id);
    if (drug) dispatch(onSetActiveDrug(drug))
  };

  const DeleteDrug = async () => {
    if (activeDrug.id === undefined) return;
    try {
      await dispatch(startDeleteDrug({ ...activeDrug, id: activeDrug.id }));
      setOpenDialog(false);
    } catch {
      // The thunk publishes the error; keep the dialog open for a retry.
    }
  };

  const onSaveOrUptdate = async (drug: Drug) => {
    if (activeDrug.id === undefined) {
      await dispatch(startSaveDrug(drug));
    } else {
      await dispatch(startUpdateDrug({ ...drug, id: activeDrug.id }));
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
    return dispatch(startLoadingDrugs(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
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
    drugs,
    activeDrug,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdDrug,
    DeleteDrug,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
