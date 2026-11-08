import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setDrugs, onAddNewDrug, onUpdateDrug, onDeleteDrug, onSetTableOptions, onLoading, onClearErrorMessage, onSetErrorMessage } from '../slices';
import type { Drug, DrugListResponse, DrugResponse } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';


const beginListRequest = createLatestListRequest();

export const startLoadingDrugs = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string, signal?: AbortSignal) => {
    return async (dispatch: Dispatch) => {
        const request = beginListRequest(dispatch, signal);
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get<DrugListResponse>(`/drug?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const drugs = data.map((drug) => {
                const { identificador: id, ...resto } = drug;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setDrugs(drugs));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        } finally {
            if (request.finish()) dispatch(onLoading(false));
        }
    }
}

export const startSaveDrug = (drug: Drug) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.post<DrugResponse>('/drug', drug, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewDrug({ id, ...resto }))
        }
        catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateDrug = (drug: Drug & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());

        try {
            const formData = new FormData();
            formData.append('descripcion', drug.descripcion);
            if (drug.logo instanceof File) {
                formData.append('logo', drug.logo);
            }
            formData.append('_method', 'PUT');

            const { data } = await calendarApi.post<DrugResponse>(`/drug/${drug.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateDrug({ id, ...resto }))
        } catch (error) {

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteDrug = (drug: Drug & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            await calendarApi.delete(`/drug/${drug.id}`,);
            dispatch(onDeleteDrug(drug.id))
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
