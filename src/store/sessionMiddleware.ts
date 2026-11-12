import type { Dispatch, Middleware, ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { onChecking, onLogin, onLogout, onSessionRefreshed, onAuthorizationFailure } from '../modules/auth/slices/authSlice';
import { authorizationChanged } from '../modules/auth/sessionAuthorization';
import type { AuthState } from '../modules/auth/types';
import { resetAuthorizationRefresh } from '../modules/auth/thunks/refreshAuthorization';
import { getSessionSignal, resetSessionScope } from '../api/sessionScope';
import { queryClient } from '../queries/queryClient';

export const isSessionBoundary = (action: unknown) =>
    onLogin.match(action) || onLogout.match(action) || onChecking.match(action);

// Runs before RTK's thunk middleware. The same dispatch identity is shared by
// auth thunks in one session, preserving their per-store request coordination.
export const sessionMiddleware: Middleware = api => {
    let signal = getSessionSignal();
    let scopedDispatch: Dispatch;
    const renewDispatch = () => {
        signal = getSessionSignal();
        const captured = signal;
        scopedDispatch = ((action: UnknownAction) => {
            if (captured.aborted) return action;
            return api.dispatch(action);
        }) as Dispatch;
    };
    renewDispatch();

    return next => action => {
        if (typeof action === 'function') {
            if (signal !== getSessionSignal()) renewDispatch();
            return (action as ThunkAction<unknown, unknown, undefined, UnknownAction>)(
                scopedDispatch, api.getState, undefined,
            );
        }
        const auth = (api.getState() as { auth: AuthState }).auth;
        const identityBoundary = isSessionBoundary(action) ||
            (onSessionRefreshed.match(action) && auth.status === 'authenticated' && auth.user.correo !== action.payload.correo);
        if (identityBoundary) resetAuthorizationRefresh(api.getState as () => { auth: AuthState });
        const accessBoundary = onAuthorizationFailure.match(action) ||
            (onSessionRefreshed.match(action) && auth.status === 'authenticated' && authorizationChanged(auth, action.payload));
        if (identityBoundary || accessBoundary) {
            resetSessionScope();
            void queryClient.cancelQueries();
            queryClient.clear();
            renewDispatch();
        }
        return next(action);
    };
};
