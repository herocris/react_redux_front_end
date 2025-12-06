import { useState } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { Confiscation } from "../";
import { useNavigate } from "react-router";
import { clearActiveConfiscation, onSetActiveConfiscation } from "../slices";
import { startDeleteConfiscation, startLoadingConfiscations, startSaveConfiscation, startUpdateConfiscation } from "../thunks";

export const useConfiscationView = () => {
  const navigate = useNavigate();
  const { activeConfiscation, confiscations, tableOptions, loading, errorMessage } = useAppSelector((state: RootState) => state.confiscation);
  const dispatch = useAppDispatch();

  const newConfication = () => {
    dispatch(clearActiveConfiscation())
    navigate('/confiscation/create')
  }

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(!openDialog);
  }

  const setIdConfiscation = async (id: string, action: string) => {
    //console.log('jkjh234lk234');
    
    if (action == 'editar') {
      //await dispatch(startLoadingConfiscation(id));
      //navigate(`/confiscation/edit/${id}`, { state: { tableOptions: tableOptions } })
      navigate(`/confiscation/edit/${id}`)
    } else {
      const confiscation = confiscations.find((row: Confiscation) => row.id === id);
      dispatch(onSetActiveConfiscation(confiscation as Confiscation))
    }
  };

  const DeleteConfiscation = async () => {
    await dispatch(startDeleteConfiscation(activeConfiscation));
    setOpenDialog(!openDialog);
  }

  const onSaveOrUptdate = async (confiscation: Confiscation) => {
    console.log(confiscation);
    if (activeConfiscation.id === undefined) {
      await dispatch(startSaveConfiscation(confiscation)).then(() => {
        newConfication()
      })
    } else {
      await dispatch(startUpdateConfiscation({ ...confiscation, id: activeConfiscation.id })).then(() => {
        newConfication()
      })
    }
    dispatch(clearActiveConfiscation())
  }



  const LoadingEntities = async (
    page: number,
    sortBy: string,
    sortType: string,
    pageSize: number,
    filterField: string,
    filterValue: string
  ) => {
    await dispatch(startLoadingConfiscations(page, sortBy, sortType, pageSize, filterField, filterValue))
  }

  const columnsTable = [
    "id",
    "fecha",
    "observacion",
    "direccion",
    "departamento",
    "municipalidad",
  ]

  return {
    tableOptions,
    loading,
    openDialog,
    columnsTable,
    confiscations,
    errorMessage,
    newConfication,
    handleOpenDialog,
    setIdConfiscation,
    DeleteConfiscation,
    LoadingEntities,
    onSaveOrUptdate,
  }
}
