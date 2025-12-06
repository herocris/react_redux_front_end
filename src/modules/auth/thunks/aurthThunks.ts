import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { onChecking, onLogin, onLogout, clearErrorMessage } from '../slices';
import { LoginData, RegisterData } from '../';

export const checkingAuthentication = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onChecking());
    }
}

export const startCreatingUserWithEmailPassword = ({ name, email, password }: RegisterData) => {
    return async (dispatch: Dispatch) => {
        dispatch(onChecking());
        try {
            const { data } = await calendarApi.post('/register', { name, email, password });
            dispatch(onLogin(data.user));
        } catch (error: any) {
            console.log(error);
            const errorMessage = error?.error?.email ?? ''
            dispatch(onLogout(errorMessage));
            setTimeout(() => {
                dispatch(clearErrorMessage());
            }, 4000);
        }
    }
}


export const startLoginWithEmailPassword = ({ email, password }: LoginData) => {
    return async (dispatch: Dispatch) => {
        dispatch(onChecking());
        try {
            const { data } = await calendarApi.post('/login', { email, password });
            //localStorage.setItem('token', data.access_token);
            dispatch(onLogin({
                nombre: data.user.name,
                correo: data.user.email,
                roles: data.roles,
                permisos: data.permissions,
            }));
        } catch (error: any) {
            console.log(error);
            
            dispatch(onLogout(error.error));
            setTimeout(() => {
                dispatch(clearErrorMessage());
            }, 4000);
        }
    }
}

export const startLogout = () => {
    return async (dispatch: Dispatch) => {
        await calendarApi.post('/logout',);
        //localStorage.removeItem('token');
        dispatch(onLogout());
    }
}

export const checkAuthToken = () => {
    return async (dispatch: Dispatch) => {
        //if ( !token ) return dispatch( onLogout() );
        try {
            const { data } = await calendarApi.post('/refresh');
            dispatch(onLogin({
                nombre: data.user.name,
                correo: data.user.email,
                roles: data.roles,
                permisos: data.permissions,
            }));
            //localStorage.setItem('token', data.access_token);
        } catch (error) {
            console.log(error);

            dispatch(onLogout());
        }
    }
}
