import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setRoles, onAddNewRole, onUpdateRole, onDeleteRol, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { Role } from '../';


export const startLoadingRoles = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/role?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const roles = data.map((role: Role) => {
                const { identificador: id, ...resto } = role;
                return { id, ...resto }
            })
            console.log(roles);
            
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setRoles(roles));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveRol = (role: Role) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/role', role);
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewRole({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateRol = (role: Role) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.put(`/role/${role.id}`, role);
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateRole({ id, ...resto }))
        } catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteRol = (role: Role) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/role/${role.id}`,);
            dispatch(onDeleteRol(role.id as string))
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

