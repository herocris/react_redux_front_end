import { useState } from "react";
import { clearActivePermission, onSetActivePermission } from "../slices";
import {startDeletePermission, startLoadingPermissions, startSavePermission, startUpdatePermission } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { Permission } from "../";

export const usePermissionView = () => {
  const { activePermission, permissions, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.permission);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (open) dispatch(clearActivePermission())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  }

  const setIdPermission = (id: string) => {
    const permission = permissions.find((row: Permission) => row.id === id);
    dispatch(onSetActivePermission(permission as Permission))
  };

  const DeletePermission = async () => {
    await dispatch(startDeletePermission(activePermission));
    setOpenDialog(!openDialog);
  }

  const onSaveOrUptdate = async (rol: Permission) => {
    console.log(rol);
    if (activePermission.id === undefined) {
      await dispatch(startSavePermission(rol)).then(() => {
        handleOpen(false)
      })
    } else {
      await dispatch(startUpdatePermission({ ...rol, id: activePermission.id })).then(() => {
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
    dispatch(startLoadingPermissions(page, sortBy, sortType, pageSize, filterField, filterValue))
  }

  const columnsTable = ['id', 'nombre']

  return {
    tableOptions,
    loading,
    open,
    openDialog,
    columnsTable,
    permissions,
    activePermission,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdPermission,
    DeletePermission,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
