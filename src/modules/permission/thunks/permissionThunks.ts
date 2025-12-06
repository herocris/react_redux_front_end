import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { Permission } from '../';
import { onAddNewPermission, onDeletePermission, onLoading, onSetErrorMessage, onSetTableOptions, onUpdatePermission, setPermissions } from '../slices';


export const startLoadingPermissions = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/permission?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const permissions = data.map((permission: Permission) => {
                const { identificador: id, ...resto } = permission;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setPermissions(permissions));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSavePermission = (permission: Permission) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/permission', permission);
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewPermission({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdatePermission = (permission: Permission) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.put(`/permission/${permission.id}`, permission);
            const { identificador: id, ...resto } = data;
            dispatch(onUpdatePermission({ id, ...resto }))
        } catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeletePermission = (permission: Permission) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/permission/${permission.id}`,);
            dispatch(onDeletePermission(permission.id as string))
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

