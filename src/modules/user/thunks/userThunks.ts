import { createLatestListRequest } from '../../../api/latestListRequest';
import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setUsers,onAddNewUser,onUpdateUser,onDeleteUser, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices/userSlice';
import type { User } from '../types';
import { getApiErrorMessage } from '../../../api/apiErrors';


const beginListRequest = createLatestListRequest();

export const startLoadingUsers = (page:number,sortBy:string,orderType:string,per_page:number,search_by:string, valueSearch: string, signal?: AbortSignal) => {
    return async( dispatch:Dispatch ) => {
        const request = beginListRequest(dispatch, signal);
        dispatch( onLoading( true ));
        dispatch(onSetErrorMessage({}));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const {data:{data,...optionsTable}} = await calendarApi.get(`/user?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`, { signal: request.signal });
            if (!request.isCurrent()) return;
            const users = data.map((user:User) => {
                const { identificador: id, ...resto } = user;
                return {  id, ...resto }
            }) 
            console.log(users);
            
            dispatch( onSetTableOptions( optionsTable ));
            dispatch( setUsers( users ));
        } catch (error) {
            if (request.signal.aborted) return;
            return handleApiError(error, dispatch);
        }finally { 
            if (request.finish()) dispatch(onLoading(false));
         }
    }
}

export const startSaveUser = (user:User) => {
    return async( dispatch:Dispatch ) => {
        dispatch( onLoading( true ));
        dispatch(onSetErrorMessage({}));
        try {
            const {data} = await calendarApi.post('/user',user); 
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewUser({  id, ...resto }))
        } 
        catch (error) {
            return handleApiError(error, dispatch);
        } finally { 
            dispatch( onLoading( false ));
         }
    }
}

export const startUpdateUser = (user:User) => {
    return async( dispatch:Dispatch ) => {
        dispatch( onLoading( true ));
        dispatch(onSetErrorMessage({}));
        try {
            const {data} = await calendarApi.put(`/user/${user.id}`,user); 
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateUser({  id, ...resto }))
        } catch (error) {
            return handleApiError(error, dispatch);
        }finally { 
            dispatch( onLoading( false ));
         }
    }
}

export const startDeleteUser = (user:User) => {
    return async( dispatch:Dispatch ) => {
        dispatch( onLoading( true ));
        dispatch(onSetErrorMessage({}));
        try {
            await calendarApi.delete(`/user/${user.id}`,); 
            dispatch(onDeleteUser(user.id as string))
        } catch (error) {
            return handleApiError(error, dispatch);
        }finally { 
            dispatch( onLoading( false ));
         }
    }
}

const handleApiError = (error: unknown, dispatch: Dispatch) => {
    dispatch(onSetErrorMessage(getApiErrorMessage(error)));
    return Promise.reject(error);
};

