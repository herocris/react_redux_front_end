import { useCallback, useEffect, useState } from 'react';
import { clearActiveUser, onSetActiveUser } from "../slices";
import { startDeleteUser, startLoadingUsers, startSaveUser, startUpdateUser } from "../thunks";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { User } from "../";
import { startLoadingPermissions, startLoadingRoles } from "../../resouce/thunks";

export const useUserView = () => {
  const { activeUser, users, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.user);
  const { permisosCollection: permisos, rolesCollection: roles } = useAppSelector((state: RootState) => state.resource);
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = (valOp:boolean) => {
    if (open) dispatch(clearActiveUser())
    setOpen(valOp);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  }

  const setIdUser = (id: string) => {
    const user = users.find((row: User) => row.id === id);
    dispatch(onSetActiveUser(user as User))
  };

  const DeleteUser = async () => {
    try {
      await dispatch(startDeleteUser(activeUser));
      setOpenDialog(false);
    } catch {
      // El thunk ya publicó el error; se conserva el diálogo para reintentar.
    }
  }

  const onSaveOrUptdate = async (user: User) => {
    try {
      if (activeUser.id === undefined) {
        await dispatch(startSaveUser(user));
      } else {
        await dispatch(startUpdateUser({ ...user, id: activeUser.id }));
      }
      handleOpen(false);
    } catch {
      // El thunk ya publicó el error; se conserva el formulario.
    }
  }

  useEffect(() => {
    dispatch(startLoadingRoles());
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
