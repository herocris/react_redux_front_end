import { combineOptionsStatus } from '../../resouce/queries/optionsStatus';
import { useAmmunitionOptions } from '../../ammunition/queries/useAmmunitionOptions';
import { useWeaponOptions } from '../../weapon/queries/useWeaponOptions';
import { useDrugOptions } from '../../drug/queries/useDrugOptions';
import  { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { RootState } from '../../../store';
import { startLoadingAmmunitions, startLoadingDrugs, startLoadingWeapons } from '../thunks';
import { AmmunitionGraphForm, DrugGraphForm, WeaponGraphForm } from '../types';

export const useGraph = () => {
    const [typeGraph, setTypeGraph] = useState('bar')
    const setGraphType = useCallback((graph: string) => {//llamando directamente al setTypeGraph y no por medio de otra funcion
        setTypeGraph(graph)
    },[typeGraph])
    const dispatch = useAppDispatch();
    const { options: drugCollection, query: drugQuery } = useDrugOptions();
    const { options: weaponCollection, query: weaponQuery } = useWeaponOptions();
    const { options: ammunitionCollection, query: ammunitionQuery } = useAmmunitionOptions();
    const optionsStatus = combineOptionsStatus(drugQuery, weaponQuery, ammunitionQuery);
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


    return {
        optionsStatus,
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
