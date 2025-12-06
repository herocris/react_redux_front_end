import { useCallback, useEffect, useState } from "react";
import { startDeleteAmmunitionConfiscation, startLoadingAmmunitionConfiscations, startSaveAmmunitionConfiscation, startUpdateAmmunitionConfiscation } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { AmmunitionConfiscation } from '../';
import { useParams } from "react-router";
import { clearActiveAmmunitionConfiscation, onSetActiveAmmunitionConfiscation } from "../slices";
import { startLoadingAmmunitionNames } from "../../resouce/thunks";


export const useAmmunitionConfiscation = () => {
  const { confiscationId } = useParams();

  const { activeAmmunitionConfiscation, ammunitionConfiscations, loading, errorMessage } = useAppSelector((state: RootState) => state.ammunitionConfiscation);
  const { ammunitionCollection } = useAppSelector((state: RootState) => state.resource);
  const { activeConfiscation } = useAppSelector((state: RootState) => state.confiscation);

  const dispatch = useAppDispatch();

  const [openAmmunitionConfiscationForm, setOpenAmmunitionConfiscationForm] = useState(false);

  const handleOpenAmmunitionConfiscationForm = useCallback((open: boolean) => {
    if (open === false && activeAmmunitionConfiscation.identificador) {
      dispatch(clearActiveAmmunitionConfiscation())
    }
    //if ( activeAmmunitionConfiscation.identificador) dispatch(clearActiveAmmunitionConfiscation())
    setOpenAmmunitionConfiscationForm(open);
  }, [openAmmunitionConfiscationForm])

  const [openDialogAmmunitionConfiscation, setOpenDialogAmmunitionConfiscation] = useState(false);
  const handleOpenDialogAmmunitionConfiscation = () => {
    setOpenDialogAmmunitionConfiscation(!openDialogAmmunitionConfiscation);
  }

  const setIdAmmunitionConfiscation = useCallback((id: string) => {
    if (id == '0' && activeConfiscation?.id) {
      const ammunitionConfiscation: AmmunitionConfiscation = { ...activeAmmunitionConfiscation, decomiso: parseInt(activeConfiscation?.id) };
      dispatch(onSetActiveAmmunitionConfiscation(ammunitionConfiscation as AmmunitionConfiscation))
    } else {
      const ammunitionConfiscation = ammunitionConfiscations.find((row: AmmunitionConfiscation) => row.identificador === id);
      console.log(ammunitionConfiscations);

      dispatch(onSetActiveAmmunitionConfiscation(ammunitionConfiscation as AmmunitionConfiscation))
    }
  }, [activeAmmunitionConfiscation, ammunitionConfiscations]);

  const onDeleteAmmunitionConfiscation = async () => {
    await dispatch(startDeleteAmmunitionConfiscation(activeAmmunitionConfiscation));
    setOpenDialogAmmunitionConfiscation(!openDialogAmmunitionConfiscation);
    setOpenAmmunitionConfiscationForm(false);
  }

  const onSaveOrUptdateAmmunitionConfiscation = async (confiscation: AmmunitionConfiscation) => {
    console.log(confiscation);
    if (activeAmmunitionConfiscation.identificador === undefined) {
      await dispatch(startSaveAmmunitionConfiscation(confiscation)).then(() => {
        handleOpenAmmunitionConfiscationForm(false)
      })
    } else {
      await dispatch(startUpdateAmmunitionConfiscation({ ...confiscation, identificador: activeAmmunitionConfiscation.identificador })).then(() => {
        handleOpenAmmunitionConfiscationForm(false)
      })
    }
    dispatch(clearActiveAmmunitionConfiscation())
  }


  const onLoadingAmmunitionConfiscation = async (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    if (confiscationId) {
      await dispatch(startLoadingAmmunitionConfiscations(parseInt(confiscationId), page, sortBy, sortType, pageSize, filterField, filterValue))
    }
  }

  useEffect(() => {
    console.log('carga lista ammunitions');
    onLoadingAmmunitionConfiscation(1, '', '', 10, '', '')
    console.log('carga selects ammunitions');
    dispatch(startLoadingAmmunitionNames());
  }, [])



  return {
    loading,
    openDialogAmmunitionConfiscation,
    openAmmunitionConfiscationForm,
    activeAmmunitionConfiscation,
    ammunitionConfiscations,
    errorMessage,
    ammunitionCollection,
    handleOpenAmmunitionConfiscationForm,
    handleOpenDialogAmmunitionConfiscation,
    setIdAmmunitionConfiscation,
    onDeleteAmmunitionConfiscation,
    onLoadingAmmunitionConfiscation,
    onSaveOrUptdateAmmunitionConfiscation,
  }
}
