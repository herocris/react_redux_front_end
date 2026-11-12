import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, SessionUser } from '../types'
import { authorizationChanged } from '../sessionAuthorization';

const user: SessionUser = {
    nombre: '', 
    correo: '',
    roles:[],
    permisos:[], 
}
const initialState: AuthState = {
    status: 'checking',
    user: user,
    errorMessage: undefined,
    authorizationRevision: 0,
    authorizationError: null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        onChecking: (state) => {
            state.authorizationError = null;
            state.status = 'checking';
            state.user = user;
            state.errorMessage = undefined;
        },
        onLogin: (state, { payload }: PayloadAction<SessionUser>) => {
            state.authorizationRevision++;
            state.authorizationError = null;
            state.status = 'authenticated';
            state.user = payload;
            state.errorMessage = undefined;
        },
        onLogout: (state, { payload }: PayloadAction<string | undefined>) => {
            state.authorizationRevision++;
            state.authorizationError = null;
            state.status = 'not-authenticated';
            state.user = user;
            state.errorMessage = payload;
        },
        clearErrorMessage: (state) => {
            state.errorMessage = undefined;
        },
        onSessionRefreshed: (state, { payload }: PayloadAction<SessionUser>) => {
            if (state.status !== 'authenticated') return;
            if (authorizationChanged(state, payload)) state.authorizationRevision++;
            state.user = payload;
            state.authorizationError = null;
        },
        onAuthorizationFailure: (state, { payload }: PayloadAction<string>) => {
            state.authorizationError = payload;
            state.authorizationRevision++;
        }
    },
})

// Action creators are generated for each case reducer function
export const { onChecking, onLogin, onLogout, clearErrorMessage, onSessionRefreshed, onAuthorizationFailure } = authSlice.actions

