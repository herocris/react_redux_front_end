import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { Role } from "../";
import { startLoadingPermissions } from "../../resouce/thunks";
import { clearActiveRole, onSetActiveRole } from "../slices";
import { startDeleteRol, startLoadingRoles, startSaveRol, startUpdateRol } from "../thunks";

export const useRoleView = () => {
  const { activeRole, roles, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.role);
  const { permisosCollection: permisos } = useAppSelector((state: RootState) => state.resource);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const handleOpen = (valOp:boolean) => {
    if (open) dispatch(clearActiveRole())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  }

  const setIdRole = (id: string) => {
    const role = roles.find((row: Role) => row.id === id);
    dispatch(onSetActiveRole(role as Role))
  };

  const DeleteRole = async () => {
    await dispatch(startDeleteRol(activeRole));
    setOpenDialog(!openDialog);
  }

  const onSaveOrUptdate = async (role: Role) => {
    console.log(role);
    if (activeRole.id === undefined) {
      await dispatch(startSaveRol(role)).then(() => {
        handleOpen(false)
      })
    } else {
      await dispatch(startUpdateRol({ ...role, id: activeRole.id })).then(() => {
        handleOpen(false)
      })
    }
  }

  useEffect(() => {
    dispatch(startLoadingPermissions());
  }, [])

  const LoadingEntities = (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    dispatch(startLoadingRoles(page, sortBy, sortType, pageSize, filterField, filterValue))
  }

  const columnsTable = ['id', 'nombre']

  return {
    roles,
    tableOptions,
    loading,
    open,
    openDialog,
    columnsTable,
    permisos,
    activeRole,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdRole,
    DeleteRole,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
