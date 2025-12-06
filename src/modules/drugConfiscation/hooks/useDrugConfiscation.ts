import { useCallback, useEffect, useState } from "react";
import { clearActiveDrugConfiscation, onSetActiveDrugConfiscation} from "../slices";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { DrugConfiscation } from '../';
import { useParams } from "react-router";
import { startDeleteDrugConfiscation, startLoadingDrugConfiscations, startSaveDrugConfiscation, startUpdateDrugConfiscation } from "../thunks";
import { startLoadingDrugNames, startLoadingDrugPresentationNames } from "../../resouce/thunks";


export const useDrugConfiscation = () => {
  const { confiscationId } = useParams();
  
  const { activeDrugConfiscation, drugConfiscations,loading, errorMessage } = useAppSelector((state: RootState) => state.drugConfiscation);
  const { drugCollection, drugPresentationCollection } = useAppSelector((state: RootState) => state.resource);
  const { activeConfiscation } = useAppSelector((state: RootState) => state.confiscation);

  const dispatch = useAppDispatch();

  const [openDrugConfiscationForm, setOpenDrugConfiscationForm] = useState(false);

  const handleOpenDrugConfiscationForm = useCallback((open: boolean) => {
    if (open === false && activeDrugConfiscation.identificador) {
      dispatch(clearActiveDrugConfiscation())
    }
    //if ( activeDrugConfiscation.identificador) dispatch(clearActiveDrugConfiscation())
    setOpenDrugConfiscationForm(open);
  },[openDrugConfiscationForm])

  
  const [openDialogDrugConfiscation, setOpenDialogDrugConfiscation] = useState(false);
  const handleOpenDialogDrugConfiscation = () => {
    setOpenDialogDrugConfiscation(!openDialogDrugConfiscation);
  }

  const setIdDrugConfiscation =useCallback( (id: string) => {
    if (id == '0' && activeConfiscation?.id) {
      const drugConfiscation: DrugConfiscation = { ...activeDrugConfiscation, decomiso: parseInt(activeConfiscation?.id) };
      dispatch(onSetActiveDrugConfiscation(drugConfiscation as DrugConfiscation))
    } else {
      const drugConfiscation = drugConfiscations.find((row: DrugConfiscation) => row.identificador === id);
      dispatch(onSetActiveDrugConfiscation(drugConfiscation as DrugConfiscation))
    }
  },[activeDrugConfiscation,drugConfiscations]);

  const onDeleteDrugConfiscation = async () => {
    await dispatch(startDeleteDrugConfiscation(activeDrugConfiscation));
    setOpenDialogDrugConfiscation(!openDialogDrugConfiscation);
    setOpenDrugConfiscationForm(false);
  }

  const onSaveOrUptdateDrugConfiscation = async (confiscation: DrugConfiscation) => {
    console.log(confiscation);
    if (activeDrugConfiscation.identificador === undefined) {
      await dispatch(startSaveDrugConfiscation(confiscation)).then(() => {
        handleOpenDrugConfiscationForm(false)
      })
    } else {
      await dispatch(startUpdateDrugConfiscation({ ...confiscation, identificador: activeDrugConfiscation.identificador })).then(() => {
        handleOpenDrugConfiscationForm(false)
      })
    }
    dispatch(clearActiveDrugConfiscation())
  }


  const onLoadingDrugConfiscation = async (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    if (confiscationId) {
      await dispatch(startLoadingDrugConfiscations(parseInt(confiscationId), page, sortBy, sortType, pageSize, filterField, filterValue))
    }
  }

  useEffect(() => {
    console.log('carga lista drugs');
    onLoadingDrugConfiscation(1, '', '', 10, '', '')
    console.log('carga selects drugs');
    dispatch(startLoadingDrugNames());
    dispatch(startLoadingDrugPresentationNames());
  }, [])



  return {
    loading,
    openDialogDrugConfiscation,
    openDrugConfiscationForm,
    activeDrugConfiscation,
    drugConfiscations,
    errorMessage,
    drugCollection,
    drugPresentationCollection,
    handleOpenDrugConfiscationForm,
    handleOpenDialogDrugConfiscation,
    setIdDrugConfiscation,
    onDeleteDrugConfiscation,
    onLoadingDrugConfiscation,
    onSaveOrUptdateDrugConfiscation,
  }
}
