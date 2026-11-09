import type { Dispatch, Middleware, ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { onChecking, onLogin, onLogout } from '../modules/auth/slices/authSlice';
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
        if (isSessionBoundary(action)) {
            resetSessionScope();
            void queryClient.cancelQueries();
            queryClient.clear();
            renewDispatch();
        }
        return next(action);
    };
};
