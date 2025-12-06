import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from '../../../store';
import { startLoadingMapItems } from '../thunks';
import { MapForm } from '../';
import { startLoadingAmmunitionNames, startLoadingDrugNames, startLoadingWeaponNames } from '../../resouce/thunks';

export const useMap = () => {
    const [typeMap, setTypeMap] = useState('location')
    const setMapType = useCallback((graph: string) => {//llamando directamente al setTypeMap y no por medio de otra funcion
        setTypeMap(graph)
    }, [typeMap])
    const dispatch = useAppDispatch();
    const { drugCollection, weaponCollection, ammunitionCollection } = useAppSelector((state: RootState) => state.resource);
    const { Mapitems } = useAppSelector((state: RootState) => state.map);

    const getMapData = (data: MapForm) => {
        console.log(data);
        dispatch(startLoadingMapItems(data))
    };

    useEffect(() => {
        dispatch(startLoadingDrugNames())
        dispatch(startLoadingWeaponNames())
        dispatch(startLoadingAmmunitionNames())
    }, [])


    return {
        typeMap,
        drugCollection,
        weaponCollection,
        ammunitionCollection,
        setMapType,
        getMapData,
        Mapitems
    }
}
