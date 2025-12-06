import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { onLoading, onSetErrorMessage, setBarLineGraphs, setPieGraphs } from '../slices';
import { AmmunitionGraphForm, DrugGraphForm, WeaponGraphForm } from '../types';


export const startLoadingDrugs = (data: DrugGraphForm) => {
    const { period, start_date, end_date, drugs, typeGraph } = data
    
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        const period_ = period === 1 ? 'month' : 'year';
        try {
            const {data:{lineBarData,pieData}} = await calendarApi.get(`drugGraphIndex?period=${period_}&start_date=${start_date}&end_date=${end_date}&drugs=[${drugs}]&typeGraph=${typeGraph}`);
            dispatch(setBarLineGraphs(lineBarData));
            dispatch(setPieGraphs(pieData));
        } catch (error) {
            console.log(error)
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}
export const startLoadingWeapons = (data: WeaponGraphForm) => {
    const { period, start_date, end_date, weapons, typeGraph } = data
    
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        const period_ = period === 1 ? 'month' : 'year';
        try {
            const {data:{lineBarData,pieData}} = await calendarApi.get(`weaponGraphIndex?period=${period_}&start_date=${start_date}&end_date=${end_date}&weapons=[${weapons}]&typeGraph=${typeGraph}`);
            dispatch(setBarLineGraphs(lineBarData));
            dispatch(setPieGraphs(pieData));
        } catch (error) {
            console.log(error)
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}
export const startLoadingAmmunitions = (data: AmmunitionGraphForm) => {
    const { period, start_date, end_date, ammunitions, typeGraph } = data
    
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        const period_ = period === 1 ? 'month' : 'year';
        try {
            const {data:{lineBarData,pieData}} = await calendarApi.get(`ammunitionGraphIndex?period=${period_}&start_date=${start_date}&end_date=${end_date}&ammunitions=[${ammunitions}]&typeGraph=${typeGraph}`);
            dispatch(setBarLineGraphs(lineBarData));
            dispatch(setPieGraphs(pieData));
        } catch (error) {
            console.log(error)
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}



const handleApiError = (error: any, dispatch: Dispatch) => {
    if (error?.hasOwnProperty('error')) {
        dispatch(onSetErrorMessage(error.error));
    }
    return Promise.reject();
};

