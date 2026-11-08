import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setPermissions, onAddNewPermission, onUpdatePermission, onDeletePermission, onSetTableOptions, onLoading, onClearErrorMessage, onSetErrorMessage } from '../slices';
import type { Permission, PermissionListResponse, PermissionResponse } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';


const beginListRequest = createLatestListRequest();

export const startLoadingPermissions = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string, signal?: AbortSignal) => {
    return async (dispatch: Dispatch) => {
        const request = beginListRequest(dispatch, signal);
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get<PermissionListResponse>(`/permission?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const permissions = data.map((permission) => {
                const { identificador: id, ...resto } = permission;
                return { id, ...resto }
            })


            dispatch(onSetTableOptions(optionsTable));
            dispatch(setPermissions(permissions));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        } finally {
            if (request.finish()) dispatch(onLoading(false));
        }
    }
}

export const startSavePermission = (permission: Permission) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.post<PermissionResponse>('/permission', permission);
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewPermission({ id, ...resto }))
        }
        catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdatePermission = (permission: Permission & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.put<PermissionResponse>(`/permission/${permission.id}`, permission);
            const { identificador: id, ...resto } = data;
            dispatch(onUpdatePermission({ id, ...resto }))
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeletePermission = (permission: Permission & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            await calendarApi.delete(`/permission/${permission.id}`,);
            dispatch(onDeletePermission(permission.id))
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
