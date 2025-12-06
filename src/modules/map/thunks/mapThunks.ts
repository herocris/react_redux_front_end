import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { onLoading, onSetErrorMessage,setMapitems } from '../slices';
import { MapForm } from '../';


export const startLoadingMapItems = (data: MapForm) => {
    const {start_date, end_date, drugs, weapons,ammunitions } = data
    
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const {data:{mapItems}} = await calendarApi.get(`confiscation/map?start_date=${start_date}&end_date=${end_date}&drugs=[${drugs}]&weapons=[${weapons}]&ammunitions=[${ammunitions}]`);
            // const itemsMap=mapItems((ite:MapState)=>{
            //     return ite
            // })
            dispatch(setMapitems(mapItems));
            //console.log(mapItems);
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

