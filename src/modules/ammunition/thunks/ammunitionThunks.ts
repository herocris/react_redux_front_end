import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setAmmunitions, onAddNewAmmunition, onUpdateAmmunition, onDeleteAmmunition, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { Ammunition } from '../';


export const startLoadingAmmunitions = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/ammunition?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const ammunitions = data.map((ammunition: Ammunition) => {
                const { identificador: id, ...resto } = ammunition;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setAmmunitions(ammunitions));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveAmmunition = (ammunition: Ammunition) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/ammunition', ammunition, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewAmmunition({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateAmmunition = (ammunition: Ammunition) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        const formData = new FormData();
        formData.append('descripcion', ammunition.descripcion);
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (ammunition.logo instanceof File) {
            formData.append('logo', ammunition.logo);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');

        try {
            const { data } = await calendarApi.post(`/ammunition/${ammunition.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateAmmunition({ id, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteAmmunition = (ammunition: Ammunition) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/ammunition/${ammunition.id}`,);
            dispatch(onDeleteAmmunition(ammunition.id as string))
        } catch (error) {
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

