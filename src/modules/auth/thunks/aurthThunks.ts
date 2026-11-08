import { getApiErrorText } from '../../../api/apiErrors';
import type { Dispatch } from '@reduxjs/toolkit';
import { onChecking, onLogin, onLogout, clearErrorMessage } from '../slices/authSlice';
import { authService } from '../services/authService';
import type { LoginData, RegisterData } from '../types';

export const checkingAuthentication = () => (dispatch: Dispatch) => {
    dispatch(onChecking());
};

export const startCreatingUserWithEmailPassword = (values: RegisterData) => {
    return async (dispatch: Dispatch): Promise<void> => {
        dispatch(clearErrorMessage());
        try {
            dispatch(onLogin(await authService.register(values)));
        } catch (error: unknown) {
            dispatch(onLogout(getApiErrorText(error)));
        }
    };
};

export const startLoginWithEmailPassword = (values: LoginData) => {
    return async (dispatch: Dispatch): Promise<void> => {
        dispatch(clearErrorMessage());
        try {
            dispatch(onLogin(await authService.login(values)));
        } catch (error: unknown) {
            dispatch(onLogout(getApiErrorText(error)));
        }
    };
};

export const startLogout = () => {
    return async (dispatch: Dispatch): Promise<void> => {
        await authService.logout();
        dispatch(onLogout());
    };
};

export const checkAuthToken = () => {
    return async (dispatch: Dispatch): Promise<void> => {
        try {
            dispatch(onLogin(await authService.checkSession()));
        } catch {
            dispatch(onLogout());
        }
    };
};
