import { useEffect, useState } from "react";
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
    await dispatch(startDeleteUser(activeUser));
    setOpenDialog(!openDialog);
  }

  const onSaveOrUptdate = async (user: User) => {
    console.log(user);
    if (activeUser.id === undefined) {
      await dispatch(startSaveUser(user)).then(() => {
        handleOpen(false)
      })
    } else {
      await dispatch(startUpdateUser({ ...user, id: activeUser.id })).then(() => {
        handleOpen(false)
      })
    }
  }

  useEffect(() => {
    dispatch(startLoadingRoles());
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
    dispatch(startLoadingUsers(page, sortBy, sortType, pageSize, filterField, filterValue))
  }

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
