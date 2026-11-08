import type { AuthState } from './types';

type SessionState = { auth: AuthState };

export const selectAuthStatus = (state: SessionState) => state.auth.status;
export const selectSessionUser = (state: SessionState) => state.auth.user;
export const selectAuthError = (state: SessionState) => state.auth.errorMessage;
