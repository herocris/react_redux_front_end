import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setConfiscations, onSetActiveConfiscation, onAddNewConfiscation, onUpdateConfiscation, onDeleteConfiscation, onSetTableOptions, onLoading, onSetErrorMessage, clearActiveConfiscation } from '../slices';
import { Confiscation } from '../';


export const startLoadingConfiscations = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/confiscation?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const confiscations = data.map((confiscation: Confiscation) => {
                const { identificador: id, ...resto } = confiscation;
                return { id, ...resto }
            })
            console.log(confiscations);
            dispatch(onSetTableOptions({ ...optionsTable, orderBy: sortBy, order: orderType, filterValue: '' }));
            dispatch(setConfiscations(confiscations));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}
export const startLoadingConfiscation = (idConfiscation: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(clearActiveConfiscation())
        try {
            const { data } = await calendarApi.get(`/confiscation/${idConfiscation}`);
            const { identificador: id, ...resto } = data;
            dispatch(onSetActiveConfiscation({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveConfiscation = (confiscation: Confiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/confiscation', confiscation);
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewConfiscation({ id, ...resto }))
            return id
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateConfiscation = (confiscation: Confiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));

        try {
            const { data } = await calendarApi.put(`/confiscation/${confiscation.id}`, confiscation);
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateConfiscation({ id, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteConfiscation = (confiscation: Confiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/confiscation/${confiscation.id}`,);
            dispatch(onDeleteConfiscation(confiscation.id as string))
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

