import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import type { Permission } from "../types";
import { clearActivePermission, onClearErrorMessage, onSetActivePermission } from "../slices";
import { startDeletePermission, startLoadingPermissions, startSavePermission, startUpdatePermission } from "../thunks";

export const usePermissionView = () => {
  const { activePermission, permissions, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.permission);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);

  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActivePermission())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActivePermission());
    setOpenDialog(value => !value);
  }

  const setIdPermission = (id: string) => {
    const permission = permissions.find((row: Permission) => row.id === id);
    if (permission) dispatch(onSetActivePermission(permission))
  };

  const DeletePermission = async () => {
    if (loading || activePermission.id === undefined) return;
    try {
      await dispatch(startDeletePermission({ ...activePermission, id: activePermission.id }));
      setOpenDialog(false);
    } catch {
      // Keep selection and confirmation for a retry; the thunk publishes the error.
    }
  };

  const onSaveOrUptdate = async (permission: Permission) => {
    if (activePermission.id === undefined) {
      await dispatch(startSavePermission(permission));
    } else {
      await dispatch(startUpdatePermission({ ...permission, id: activePermission.id }));
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
    return dispatch(startLoadingPermissions(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
      .catch(() => {
        // The thunk records errors in the module state.
      });
  }, [dispatch]);

  const columnsTable = ['id', 'nombre']

  return {
    permissions,
    tableOptions,
    loading,
    open,
    openDialog,
    columnsTable,

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
