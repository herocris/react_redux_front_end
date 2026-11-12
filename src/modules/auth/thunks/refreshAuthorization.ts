import type { Dispatch } from '@reduxjs/toolkit';
import { getSessionSignal } from '../../../api/sessionScope';
import { getApiErrorKind, getApiErrorText } from '../../../api/apiErrors';
import { authService } from '../services/authService';
import { onAuthorizationFailure, onLogout, onSessionRefreshed } from '../slices/authSlice';
import type { AuthState } from '../types';

export const AUTHORIZATION_INTERVAL = 60_000;
export const FORBIDDEN_COOLDOWN = 30_000;
type Reason = 'passive' | 'interval' | 'forbidden' | 'manual';
type GetState = () => { auth: AuthState };
// Coordination metadata only, scoped to the store. No identity or credentials.
const checks = new WeakMap<GetState, {
    pending?: { signal: AbortSignal; promise: Promise<void>; controller: AbortController };
    passiveAt: number; forbiddenAt: number; paused: number;
}>();

const coordination = (getState: GetState) => {
    let check = checks.get(getState);
    if (!check) {
        check = { passiveAt: -Infinity, forbiddenAt: -Infinity, paused: 0 };
        checks.set(getState, check);
    }
    return check;
};

export const resetAuthorizationRefresh = (getState: GetState) => {
    checks.get(getState)?.pending?.controller.abort();
    checks.delete(getState);
};

// A permission response must not supersede a logout already in progress.
export const pauseAuthorizationRefresh = (getState: GetState) => {
    const check = coordination(getState);
    check.paused++;
    check.pending?.controller.abort();
    check.pending = undefined;
    return () => { check.paused--; };
};

export const refreshAuthorization = (reason: Reason = 'manual') =>
    (dispatch: Dispatch, getState: GetState): Promise<void> => {
        if (getState().auth.status !== 'authenticated') return Promise.resolve();
        const signal = getSessionSignal();
        const check = coordination(getState);
        if (check.paused) return Promise.resolve();
        if (check.pending?.signal === signal) {
            if (reason === 'forbidden') check.forbiddenAt = Date.now();
            return check.pending.promise;
        }
        const now = Date.now();
        if ((reason === 'passive' || reason === 'interval') && getState().auth.authorizationError !== null) return Promise.resolve();
        if (reason === 'passive' && now - check.passiveAt < AUTHORIZATION_INTERVAL) return Promise.resolve();
        if (reason === 'forbidden' && now - check.forbiddenAt < FORBIDDEN_COOLDOWN) return Promise.resolve();
        check.passiveAt = now;
        if (reason === 'forbidden') check.forbiddenAt = now;
        const record = check;
        const controller = new AbortController();
        const promise = (async () => {
            try {
                const user = await authService.checkSession(AbortSignal.any([signal, controller.signal, AbortSignal.timeout(10_000)]));
                if (!signal.aborted && !controller.signal.aborted) dispatch(onSessionRefreshed(user));
            } catch (error) {
                if (signal.aborted || controller.signal.aborted) return;
                if (getApiErrorKind(error) === 'unauthenticated') dispatch(onLogout());
                else dispatch(onAuthorizationFailure(getApiErrorText(error)));
            }
        })().finally(() => {
            if (record.pending?.promise === promise) record.pending = undefined;
        });
        record.pending = { signal, promise, controller };
        return promise;
    };
