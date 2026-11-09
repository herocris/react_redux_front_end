import { combineOptionsStatus } from '../../resouce/queries/optionsStatus';
import { useAmmunitionOptions } from '../../ammunition/queries/useAmmunitionOptions';
import { useWeaponOptions } from '../../weapon/queries/useWeaponOptions';
import { useDrugOptions } from '../../drug/queries/useDrugOptions';
import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from '../../../store';
import { startLoadingMapItems } from '../thunks';
import { MapForm } from '../';

export const useMap = () => {
    const [typeMap, setTypeMap] = useState('location')
    const setMapType = useCallback((graph: string) => {//llamando directamente al setTypeMap y no por medio de otra funcion
        setTypeMap(graph)
    }, [typeMap])
    const dispatch = useAppDispatch();
    const { options: drugCollection, query: drugQuery } = useDrugOptions();
    const { options: weaponCollection, query: weaponQuery } = useWeaponOptions();
    const { options: ammunitionCollection, query: ammunitionQuery } = useAmmunitionOptions();
    const optionsStatus = combineOptionsStatus(drugQuery, weaponQuery, ammunitionQuery);
    const { Mapitems } = useAppSelector((state: RootState) => state.map);

    const getMapData = (data: MapForm) => {
        console.log(data);
        dispatch(startLoadingMapItems(data))
    };


    return {
        optionsStatus,
        typeMap,
        drugCollection,
        weaponCollection,
        ammunitionCollection,
        setMapType,
        getMapData,
        Mapitems
    }
}
