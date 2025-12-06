import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setAmmunitionConfiscations, onAddNewAmmunitionConfiscation, onUpdateAmmunitionConfiscation, onDeleteAmmunitionConfiscation, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { AmmunitionConfiscation } from '..';

export const startLoadingAmmunitionConfiscations = (idConfiscation: number, page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/ammunitionConfiscation/${idConfiscation}/confiscation?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const ammunitionConfiscations = data.map((ammunitionConfiscation: any) => {
                const { decomiso, municion, ...resto } = ammunitionConfiscation;
                return { decomiso: decomiso.identificador, municion: municion.identificador, municion_nombre: municion.descripcion, ...resto }
            })
            //console.log(ammunitionConfiscations);

            dispatch(onSetTableOptions(optionsTable));
            dispatch(setAmmunitionConfiscations(ammunitionConfiscations));
        } catch (error) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveAmmunitionConfiscation = (ammunitionConfiscation: AmmunitionConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/ammunitionConfiscation', ammunitionConfiscation, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { decomiso, municion, ...resto } = data;
            dispatch(onAddNewAmmunitionConfiscation({ decomiso: decomiso.identificador, municion: municion.identificador, municion_nombre: municion.descripcion, ...resto }))
        }
        catch (error: any) {
            console.log(error);
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateAmmunitionConfiscation = (ammunitionConfiscation: AmmunitionConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        const formData = new FormData();
        formData.append('cantidad', ammunitionConfiscation.cantidad.toString());
        formData.append('decomiso', ammunitionConfiscation.decomiso.toString());
        formData.append('municion', ammunitionConfiscation.municion.toString());
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (ammunitionConfiscation.foto instanceof File) {
            formData.append('foto', ammunitionConfiscation.foto);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');

        try {
            const { data } = await calendarApi.post(`/ammunitionConfiscation/${ammunitionConfiscation.identificador}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { decomiso, municion, ...resto } = data;
            dispatch(onUpdateAmmunitionConfiscation({ decomiso: decomiso.identificador, municion: municion.identificador, municion_nombre: municion.descripcion, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteAmmunitionConfiscation = (ammunitionConfiscation: AmmunitionConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/ammunitionConfiscation/${ammunitionConfiscation.identificador}`,);
            dispatch(onDeleteAmmunitionConfiscation(ammunitionConfiscation.identificador as string))
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

