import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setDrugConfiscations, onAddNewDrugConfiscation, onUpdateDrugConfiscation, onDeleteDrugConfiscation, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { DrugConfiscation } from '../';


export const startLoadingDrugConfiscations = (idConfiscation: number, page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/drugConfiscation/${idConfiscation}/confiscation?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const drugConfiscations = data.map((drugConfiscation: any) => {
                const { decomiso, droga, presentacion, ...resto } = drugConfiscation;
                return { decomiso: decomiso.identificador, droga: droga.identificador, droga_nombre: droga.descripcion, presentacion: presentacion.identificador, presentacion_nombre: presentacion.descripcion, ...resto }
            })
            //console.log(drugConfiscations);

            dispatch(onSetTableOptions(optionsTable));
            dispatch(setDrugConfiscations(drugConfiscations));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveDrugConfiscation = (drugConfiscation: DrugConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/drugConfiscation', drugConfiscation, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { decomiso, droga, presentacion, ...resto } = data;
            dispatch(onAddNewDrugConfiscation({ decomiso: decomiso.identificador, droga: droga.identificador, droga_nombre: droga.descripcion, presentacion: presentacion.identificador, presentacion_nombre: presentacion.descripcion, ...resto }))
        }
        catch (error: any) {
            console.log(error);
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateDrugConfiscation = (drugConfiscation: DrugConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));

        const formData = new FormData();
        formData.append('cantidad', drugConfiscation.cantidad.toString());
        formData.append('peso', drugConfiscation.peso.toString());
        formData.append('decomiso', drugConfiscation.decomiso.toString());
        formData.append('droga', drugConfiscation.droga.toString());
        formData.append('presentacion', drugConfiscation.presentacion.toString());
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (drugConfiscation.foto instanceof File) {
            formData.append('foto', drugConfiscation.foto);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');
        
        try {
            const { data } = await calendarApi.post(`/drugConfiscation/${drugConfiscation.identificador}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { decomiso, droga, presentacion, ...resto } = data;
            dispatch(onUpdateDrugConfiscation({ decomiso: decomiso.identificador, droga: droga.identificador, droga_nombre: droga.descripcion, presentacion: presentacion.identificador, presentacion_nombre: presentacion.descripcion, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteDrugConfiscation = (drugConfiscation: DrugConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/drugConfiscation/${drugConfiscation.identificador}`,);
            dispatch(onDeleteDrugConfiscation(drugConfiscation.identificador as string))
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

