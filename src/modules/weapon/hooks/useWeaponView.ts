import { useState } from "react";
import { clearActiveWeapon, onSetActiveWeapon} from "../slices";
import {startDeleteWeapon, startLoadingWeapons, startSaveWeapon, startUpdateWeapon } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { Weapon } from "../";

export const useWeaponView = () => {
  const { activeWeapon, weapons, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.weapon);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (open) dispatch(clearActiveWeapon())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  }

  const setIdWeapon = (id: string) => {
    const weapon = weapons.find((row: Weapon) => row.id === id);
    dispatch(onSetActiveWeapon(weapon as Weapon))
  };

  const DeleteWeapon = async () => {
    await dispatch(startDeleteWeapon(activeWeapon));
    setOpenDialog(!openDialog);
  }

  const onSaveOrUptdate = async (weapon: Weapon) => {
    console.log(weapon);
    if (activeWeapon.id === undefined) {
      await dispatch(startSaveWeapon(weapon)).then(() => {
        handleOpen(false)
      })
    } else {
      await dispatch(startUpdateWeapon({ ...weapon, id: activeWeapon.id })).then(() => {
        handleOpen(false)
      })
    }
     dispatch(clearActiveWeapon())
  }


  const LoadingEntities = (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    dispatch(startLoadingWeapons(page, sortBy, sortType, pageSize, filterField, filterValue))
  }

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
