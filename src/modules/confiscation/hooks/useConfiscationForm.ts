import { useState } from "react";
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from "../../../store";
import { Confiscation } from "../";
import { useNavigate } from "react-router";
import { startSaveConfiscation, startUpdateConfiscation } from "../thunks";

export const useConfiscationForm = () => {
    
    const navigate = useNavigate();
    const [openMap, setOpenMap] = useState(false)
    const { activeConfiscation, loading, errorMessage } = useAppSelector((state: RootState) => state.confiscation);
    const dispatch = useAppDispatch();

    const onSaveOrUptdate = async (confiscation: Confiscation) => {
        console.log(confiscation);
        if (activeConfiscation.id === undefined) {
            await dispatch(startSaveConfiscation(confiscation)).then((idConf) => {
                navigate(`/confiscation/edit/${idConf}`)
            })
        } else {
            await dispatch(startUpdateConfiscation({ ...confiscation, id: activeConfiscation.id })).then(() => {
                //navigate(`/confiscation/edit/${activeConfiscation.identificador}`)
            })
        }
    }


    const handleOpenMap = (open: boolean) => {
        setOpenMap(open)
    }


    return {
        loading,
        activeConfiscation,
        openMap,
        errorMessage,
        onSaveOrUptdate,
        handleOpenMap
    }
}
