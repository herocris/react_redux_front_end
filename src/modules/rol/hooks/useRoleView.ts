import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import type { Role } from "../types";
import { startLoadingPermissions } from "../../resouce/thunks";
import { clearActiveRole, onClearErrorMessage, onSetActiveRole } from "../slices";
import { startDeleteRol, startLoadingRoles, startSaveRol, startUpdateRol } from "../thunks";

export const useRoleView = () => {
  const { activeRole, roles, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.role);
  const { permisosCollection: permisos } = useAppSelector((state: RootState) => state.resource);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActiveRole())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActiveRole());
    setOpenDialog(value => !value);
  }

  const setIdRole = (id: string) => {
    const role = roles.find((row: Role) => row.id === id);
    if (role) dispatch(onSetActiveRole(role))
  };

  const DeleteRole = async () => {
    if (loading || activeRole.id === undefined) return;
    try {
      await dispatch(startDeleteRol({ ...activeRole, id: activeRole.id }));
      setOpenDialog(false);
    } catch {
      // Keep selection and confirmation for a retry; the thunk publishes the error.
    }
  };

  const onSaveOrUptdate = async (role: Role) => {
    if (activeRole.id === undefined) {
      await dispatch(startSaveRol(role));
    } else {
      await dispatch(startUpdateRol({ ...role, id: activeRole.id }));
    }
    handleOpen(false);
  };

  useEffect(() => {
    dispatch(startLoadingPermissions());
  }, [dispatch])

  const LoadingEntities = useCallback((
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string,
    signal?: AbortSignal
  ) => {
    return dispatch(startLoadingRoles(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
      .catch(() => {
        // The thunk records errors in the module state.
      });
  }, [dispatch]);

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
