import { usePermissionOptions } from '../../permission/queries/usePermissionOptions';
import { useCallback, useEffect, useState } from 'react';
import { clearActiveUser, onClearErrorMessage, onSetActiveUser } from "../slices";
import { startDeleteUser, startLoadingUsers, startSaveUser, startUpdateUser } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { User } from "../";
import { startLoadingRoles } from "../../resouce/thunks";

export const useUserView = () => {
  const { activeUser, users, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.user);
  const { rolesCollection: roles } = useAppSelector((state: RootState) => state.resource);
  const dispatch = useAppDispatch();
  const { permisos, permissionOptionsQuery } = usePermissionOptions();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (!valOp) dispatch(clearActiveUser())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    if (loading) return;
    dispatch(onClearErrorMessage());
    if (openDialog) dispatch(clearActiveUser());
    setOpenDialog(value => !value);
  }

  const setIdUser = (id: string) => {
    const user = users.find((row: User) => row.id === id);
    if (user) dispatch(onSetActiveUser(user))
  };

  const DeleteUser = async () => {
    if (loading || activeUser.id === undefined) return;
    try {
      await dispatch(startDeleteUser({ ...activeUser, id: activeUser.id }));
      setOpenDialog(false);
    } catch {
      // El thunk ya publicó el error; se conserva el diálogo para reintentar.
    }
  }

  const onSaveOrUptdate = async (user: User) => {
    if (activeUser.id === undefined) {
      await dispatch(startSaveUser(user));
    } else {
      await dispatch(startUpdateUser({ ...user, id: activeUser.id }));
    }
    handleOpen(false);
  };

  useEffect(() => {
    dispatch(startLoadingRoles());
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
    return dispatch(startLoadingUsers(page, sortBy, sortType, pageSize, filterField, filterValue, signal))
      .catch(() => {
        // The thunk records errors in the module state.
      });
  }, [dispatch]);

  const columnsTable = ['id', 'nombre', 'correo']

  return {
    users,
    tableOptions,
    loading,
    open,
    openDialog,
    columnsTable,
    permisos,
    permissionOptionsQuery,
    roles,
    activeUser,
    errorMessage,
    handleOpen,
    handleOpenDialog,
    setIdUser,
    DeleteUser,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
