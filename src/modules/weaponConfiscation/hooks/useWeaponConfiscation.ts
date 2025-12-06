import { useCallback, useEffect, useState } from "react";
import { clearActiveWeaponConfiscation, onSetActiveWeaponConfiscation } from "../slices";
import { startDeleteWeaponConfiscation, startLoadingWeaponConfiscations, startSaveWeaponConfiscation, startUpdateWeaponConfiscation } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { WeaponConfiscation } from '../';
import { useParams } from "react-router";
import { startLoadingWeaponNames } from "../../resouce/thunks";


export const useWeaponConfiscation = () => {
  const { confiscationId } = useParams();
  
  const { activeWeaponConfiscation, weaponConfiscations,loading, errorMessage } = useAppSelector((state: RootState) => state.weaponConfiscation);
  const { weaponCollection } = useAppSelector((state: RootState) => state.resource);
  const { activeConfiscation } = useAppSelector((state: RootState) => state.confiscation);

  const dispatch = useAppDispatch();

  const [openWeaponConfiscationForm, setOpenWeaponConfiscationForm] = useState(false);

  const handleOpenWeaponConfiscationForm = useCallback((open: boolean) => {
    if (open === false && activeWeaponConfiscation.identificador) {
      dispatch(clearActiveWeaponConfiscation())
    }
    //if ( activeWeaponConfiscation.identificador) dispatch(clearActiveWeaponConfiscation())
    setOpenWeaponConfiscationForm(open);
  },[openWeaponConfiscationForm])

  const [openDialogWeaponConfiscation, setOpenDialogWeaponConfiscation] = useState(false);
  const handleOpenDialogWeaponConfiscation = () => {
    setOpenDialogWeaponConfiscation(!openDialogWeaponConfiscation);
  }

  const setIdWeaponConfiscation = useCallback((id: string) => {
    if (id == '0' && activeConfiscation?.id) {
      const weaponConfiscation: WeaponConfiscation = { ...activeWeaponConfiscation, decomiso: parseInt(activeConfiscation?.id) };
      dispatch(onSetActiveWeaponConfiscation(weaponConfiscation as WeaponConfiscation))
    } else {
      const weaponConfiscation = weaponConfiscations.find((row: WeaponConfiscation) => row.identificador === id);
      console.log(weaponConfiscations);
      
      dispatch(onSetActiveWeaponConfiscation(weaponConfiscation as WeaponConfiscation))
    }
  },[activeWeaponConfiscation,weaponConfiscations]);

  const onDeleteWeaponConfiscation = async () => {
    await dispatch(startDeleteWeaponConfiscation(activeWeaponConfiscation));
    setOpenDialogWeaponConfiscation(!openDialogWeaponConfiscation);
    setOpenWeaponConfiscationForm(false);
  }

  const onSaveOrUptdateWeaponConfiscation = async (confiscation: WeaponConfiscation) => {
    console.log(confiscation);
    if (activeWeaponConfiscation.identificador === undefined) {
      await dispatch(startSaveWeaponConfiscation(confiscation)).then(() => {
        handleOpenWeaponConfiscationForm(false)
      })
    } else {
      await dispatch(startUpdateWeaponConfiscation({ ...confiscation, identificador: activeWeaponConfiscation.identificador })).then(() => {
        handleOpenWeaponConfiscationForm(false)
      })
    }
    dispatch(clearActiveWeaponConfiscation())
  }


  const onLoadingWeaponConfiscation = async (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    if (confiscationId) {
      await dispatch(startLoadingWeaponConfiscations(parseInt(confiscationId), page, sortBy, sortType, pageSize, filterField, filterValue))
    }
  }

  useEffect(() => {
    console.log('carga lista Weapon');
    onLoadingWeaponConfiscation(1, '', '', 10, '', '')
    console.log('carga selects Weapon');
    dispatch(startLoadingWeaponNames());
  }, [])




  return {
    loading,
    openDialogWeaponConfiscation,
    openWeaponConfiscationForm,
    activeWeaponConfiscation,
    weaponConfiscations,
    errorMessage,
    weaponCollection,
    handleOpenWeaponConfiscationForm,
    handleOpenDialogWeaponConfiscation,
    setIdWeaponConfiscation,
    onDeleteWeaponConfiscation,
    onLoadingWeaponConfiscation,
    onSaveOrUptdateWeaponConfiscation,
  }
}
