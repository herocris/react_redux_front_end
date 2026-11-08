import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setRoles, onAddNewRole, onUpdateRole, onDeleteRol, onSetTableOptions, onLoading, onClearErrorMessage, onSetErrorMessage } from '../slices';
import type { Role, RoleListResponse, RoleResponse } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';


const beginListRequest = createLatestListRequest();

export const startLoadingRoles = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string, signal?: AbortSignal) => {
    return async (dispatch: Dispatch) => {
        const request = beginListRequest(dispatch, signal);
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get<RoleListResponse>(`/role?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const roles = data.map((role) => {
                const { identificador: id, ...resto } = role;
                return { id, ...resto }
            })


            dispatch(onSetTableOptions(optionsTable));
            dispatch(setRoles(roles));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        } finally {
            if (request.finish()) dispatch(onLoading(false));
        }
    }
}

export const startSaveRol = (role: Role) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.post<RoleResponse>('/role', role);
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewRole({ id, ...resto }))
        }
        catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateRol = (role: Role & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            const { data } = await calendarApi.put<RoleResponse>(`/role/${role.id}`, role);
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateRole({ id, ...resto }))
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteRol = (role: Role & { id: string }) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        dispatch(onClearErrorMessage());
        try {
            await calendarApi.delete(`/role/${role.id}`,);
            dispatch(onDeleteRol(role.id))
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
