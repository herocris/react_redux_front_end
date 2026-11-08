import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setAmmunitions, onAddNewAmmunition, onUpdateAmmunition, onDeleteAmmunition, onSetTableOptions, onLoading, onClearErrorMessage, onSetErrorMessage } from '../slices';
import type { Ammunition, AmmunitionListResponse, AmmunitionResponse } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';


const beginListRequest = createLatestListRequest();

export const startLoadingAmmunitions = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string, signal?: AbortSignal) => {
    return async (dispatch: Dispatch) => {
        const request = beginListRequest(dispatch, signal);
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get<AmmunitionListResponse>(`/ammunition?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const ammunitions = data.map((ammunition) => {
                const { identificador: id, ...resto } = ammunition;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setAmmunitions(ammunitions));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        } finally {
            if (request.finish()) dispatch(onLoading(false));
        }
    }
}

export const startSaveAmmunition = (ammunition: Ammunition) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.post<AmmunitionResponse>('/ammunition', ammunition, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewAmmunition({ id, ...resto }))
        }
        catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateAmmunition = (ammunition: Ammunition & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());

        try {
            const formData = new FormData();
            formData.append('descripcion', ammunition.descripcion);
            if (ammunition.logo instanceof File) {
                formData.append('logo', ammunition.logo);
            }
            formData.append('_method', 'PUT');

            const { data } = await calendarApi.post<AmmunitionResponse>(`/ammunition/${ammunition.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateAmmunition({ id, ...resto }))
        } catch (error) {

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteAmmunition = (ammunition: Ammunition & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            await calendarApi.delete(`/ammunition/${ammunition.id}`,);
            dispatch(onDeleteAmmunition(ammunition.id))
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

const handleApiError = (error: unknown, dispatch: Dispatch) => {
    dispatch(onSetErrorMessage(getApiErrorMessage(error)));
    return Promise.reject(error);
};
