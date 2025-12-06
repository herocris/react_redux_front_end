import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setDrugs, onAddNewDrug, onUpdateDrug, onDeleteDrug, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { Drug } from '../';


export const startLoadingDrugs = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/drug?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const drugs = data.map((drug: Drug) => {
                const { identificador: id, ...resto } = drug;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setDrugs(drugs));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveDrug = (drug: Drug) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/drug', drug, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewDrug({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateDrug = (drug: Drug) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));

        const formData = new FormData();
        formData.append('descripcion', drug.descripcion);
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (drug.logo instanceof File) {
            formData.append('logo', drug.logo);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');

        try {
            const { data } = await calendarApi.post(`/drug/${drug.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateDrug({ id, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteDrug = (drug: Drug) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/drug/${drug.id}`,);
            dispatch(onDeleteDrug(drug.id as string))
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

