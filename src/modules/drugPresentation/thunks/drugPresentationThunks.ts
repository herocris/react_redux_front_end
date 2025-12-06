import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setDrugPresentations, onAddNewDrugPresentation, onUpdateDrugPresentation, onDeleteDrugPresentation, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { DrugPresentation } from '../';


export const startLoadingDrugPresentations = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/drugPresentation?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const drugPresentations = data.map((drugPresentation: DrugPresentation) => {
                const { identificador: id, ...resto } = drugPresentation;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setDrugPresentations(drugPresentations));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveDrugPresentation = (drugPresentation: DrugPresentation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/drugPresentation', drugPresentation, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewDrugPresentation({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateDrugPresentation = (drugPresentation: DrugPresentation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));

        const formData = new FormData();
        formData.append('descripcion', drugPresentation.descripcion);
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (drugPresentation.logo instanceof File) {
            formData.append('logo', drugPresentation.logo);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');

        try {
            const { data } = await calendarApi.post(`/drugPresentation/${drugPresentation.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateDrugPresentation({ id, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteDrugPresentation = (drugPresentation: DrugPresentation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/drugPresentation/${drugPresentation.id}`,);
            dispatch(onDeleteDrugPresentation(drugPresentation.id as string))
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

