import { useState } from "react";
import { clearActiveDrugPresentation, onSetActiveDrugPresentation} from "../slices";
import { startDeleteDrugPresentation, startLoadingDrugPresentations, startSaveDrugPresentation, startUpdateDrugPresentation } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { DrugPresentation } from "../";

export const useDrugPresentationView = () => {
  const { activeDrugPresentation, drugPresentations, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.drugPresentation);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (open) dispatch(clearActiveDrugPresentation())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  }

  const setIdDrugPresentation = (id: string) => {
    const drugPresentation = drugPresentations.find((row: DrugPresentation) => row.id === id);
    dispatch(onSetActiveDrugPresentation(drugPresentation as DrugPresentation))
  };

  const DeleteDrugPresentation = async () => {
    await dispatch(startDeleteDrugPresentation(activeDrugPresentation));
    setOpenDialog(!openDialog);
  }

  const onSaveOrUptdate = async (drugPresentation: DrugPresentation) => {
    console.log(drugPresentation);
    if (activeDrugPresentation.id === undefined) {
      await dispatch(startSaveDrugPresentation(drugPresentation)).then(() => {
        handleOpen(false)
      })
    } else {
      await dispatch(startUpdateDrugPresentation({ ...drugPresentation, id: activeDrugPresentation.id })).then(() => {
        handleOpen(false)
      })
    }
  }

  const LoadingEntities = (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    dispatch(startLoadingDrugPresentations(page, sortBy, sortType, pageSize, filterField, filterValue))
  }


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
