import  { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from '../../../store';
import { startLoadingAmmunitions, startLoadingDrugs, startLoadingWeapons } from '../thunks';
import { AmmunitionGraphForm, DrugGraphForm, WeaponGraphForm } from '../types';
import { startLoadingAmmunitionNames, startLoadingDrugNames, startLoadingWeaponNames } from '../../resouce/thunks';

export const useGraph = () => {
    const [typeGraph, setTypeGraph] = useState('bar')
    const setGraphType = useCallback((graph: string) => {//llamando directamente al setTypeGraph y no por medio de otra funcion
        setTypeGraph(graph)
    },[typeGraph])
    const dispatch = useAppDispatch();
    const { drugCollection, weaponCollection, ammunitionCollection } = useAppSelector((state: RootState) => state.resource);
    const { barLineGraph, pieGraph } = useAppSelector((state: RootState) => state.graph);

    const getGraphData = (data: DrugGraphForm | WeaponGraphForm | AmmunitionGraphForm, type: string) => {
        if (type === 'Drogas') {
            dispatch(startLoadingDrugs(data as DrugGraphForm))
        } else if (type === 'Armas') {
            dispatch(startLoadingWeapons(data as WeaponGraphForm))
        } else if (type === 'Municiones') {
            dispatch(startLoadingAmmunitions(data as AmmunitionGraphForm))
        }
    };

    useEffect(() => {
        dispatch(startLoadingDrugNames())
        dispatch(startLoadingWeaponNames())
        dispatch(startLoadingAmmunitionNames())
    }, [])


    return {
        typeGraph,
        drugCollection,
        weaponCollection,
        ammunitionCollection,
        barLineGraph,
        pieGraph,
        setGraphType,
        getGraphData,
    }
}
