import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setDrugPresentations, onAddNewDrugPresentation, onUpdateDrugPresentation, onDeleteDrugPresentation, onSetTableOptions, onLoading, onClearErrorMessage, onSetErrorMessage } from '../slices';
import type { DrugPresentation, DrugPresentationListResponse, DrugPresentationResponse } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';


const beginListRequest = createLatestListRequest();

export const startLoadingDrugPresentations = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string, signal?: AbortSignal) => {
    return async (dispatch: Dispatch) => {
        const request = beginListRequest(dispatch, signal);
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get<DrugPresentationListResponse>(`/drugPresentation?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const drugPresentations = data.map((drugPresentation) => {
                const { identificador: id, ...resto } = drugPresentation;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setDrugPresentations(drugPresentations));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        } finally {
            if (request.finish()) dispatch(onLoading(false));
        }
    }
}

export const startSaveDrugPresentation = (drugPresentation: DrugPresentation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.post<DrugPresentationResponse>('/drugPresentation', drugPresentation, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewDrugPresentation({ id, ...resto }))
        }
        catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateDrugPresentation = (drugPresentation: DrugPresentation & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());

        try {
            const formData = new FormData();
            formData.append('descripcion', drugPresentation.descripcion);
            if (drugPresentation.logo instanceof File) {
                formData.append('logo', drugPresentation.logo);
            }
            formData.append('_method', 'PUT');

            const { data } = await calendarApi.post<DrugPresentationResponse>(`/drugPresentation/${drugPresentation.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateDrugPresentation({ id, ...resto }))
        } catch (error) {

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteDrugPresentation = (drugPresentation: DrugPresentation & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            await calendarApi.delete(`/drugPresentation/${drugPresentation.id}`,);
            dispatch(onDeleteDrugPresentation(drugPresentation.id))
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
