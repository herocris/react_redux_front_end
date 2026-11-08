import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setPermissions, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } from '../slices';
import type { ActivityListResponse } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';
import dayjs from "dayjs";


const beginListRequest = createLatestListRequest();

export const startLoadingActivities = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string, signal?: AbortSignal) => {
    return async (dispatch: Dispatch) => {
        const request = beginListRequest(dispatch, signal);
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get<ActivityListResponse>(`/activity?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const activities = data.map((activity) => {
                
                const { identificador: id, cambios,fecha, ...resto } = activity;
                const formatted = dayjs(fecha).format("DD-MM-YYYY HH:mm:ss");
                return { id,cambios:JSON.stringify(cambios),fecha:formatted, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setPermissions(activities));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        } finally {
            if (request.finish()) dispatch(onLoading(false));
        }
    }
}


const handleApiError = (error: unknown, dispatch: Dispatch) => {
    dispatch(onSetErrorMessage(getApiErrorMessage(error)));
    return Promise.reject(error);
};

