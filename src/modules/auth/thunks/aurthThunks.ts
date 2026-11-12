import { getApiErrorKind, getApiErrorText } from '../../../api/apiErrors';
import type { Dispatch } from '@reduxjs/toolkit';
import { onChecking, onLogin, onLogout, clearErrorMessage, onAuthenticationFailure } from '../slices/authSlice';
import { authService } from '../services/authService';
import type { AuthState, LoginData, RegisterData } from '../types';
import { getSessionSignal } from '../../../api/sessionScope';
import { pauseAuthorizationRefresh } from './refreshAuthorization';

const authRequests = new WeakMap<Dispatch, AbortController>();
const beginAuthRequest = (dispatch: Dispatch) => {
    authRequests.get(dispatch)?.abort();
    const controller = new AbortController();
    const sessionSignal = getSessionSignal();
    authRequests.set(dispatch, controller);
    return {
        signal: controller.signal,
        isCurrent: () => !controller.signal.aborted && !sessionSignal.aborted,
    };
};

export const checkingAuthentication = () => (dispatch: Dispatch) => {
    dispatch(onChecking());
};

export const startCreatingUserWithEmailPassword = (values: RegisterData) => {
    return async (dispatch: Dispatch, getState: () => { auth: AuthState }): Promise<void> => {
        const request = beginAuthRequest(dispatch);
        dispatch(clearErrorMessage());
        try {
            const user = await authService.register(values, request.signal);
            if (request.isCurrent()) dispatch(onLogin(user));
        } catch (error: unknown) {
            if (request.isCurrent()) dispatch(getState().auth.status === 'not-authenticated'
                ? onAuthenticationFailure(getApiErrorText(error)) : onLogout(getApiErrorText(error)));
        }
    };
};

export const startLoginWithEmailPassword = (values: LoginData) => {
    return async (dispatch: Dispatch, getState: () => { auth: AuthState }): Promise<void> => {
        const request = beginAuthRequest(dispatch);
        dispatch(clearErrorMessage());
        try {
            const user = await authService.login(values, request.signal);
            if (request.isCurrent()) dispatch(onLogin(user));
        } catch (error: unknown) {
            if (request.isCurrent()) dispatch(getState().auth.status === 'not-authenticated'
                ? onAuthenticationFailure(getApiErrorText(error)) : onLogout(getApiErrorText(error)));
        }
    };
};

export const startLogout = () => {
    return async (dispatch: Dispatch, getState: () => { auth: AuthState }): Promise<void> => {
        const resume = pauseAuthorizationRefresh(getState);
        const request = beginAuthRequest(dispatch);
        try {
            await authService.logout(request.signal);
            if (request.isCurrent()) dispatch(onLogout());
        } finally { resume(); }
    };
};

export const checkAuthToken = () => {
    return async (dispatch: Dispatch): Promise<void> => {
        const request = beginAuthRequest(dispatch);
        try {
            const user = await authService.checkSession(request.signal);
            if (request.isCurrent()) dispatch(onLogin(user));
        } catch (error) {
            if (!request.isCurrent()) return;
            // A forbidden session check is not proof that the session expired.
            if (getApiErrorKind(error) === 'forbidden') throw error;
            dispatch(onLogout());
        }
    };
};
