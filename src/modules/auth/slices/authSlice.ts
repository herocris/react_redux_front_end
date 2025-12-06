import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { AuthState } from '../'
import { User } from '../../user'

const user: User = {
    nombre: '', 
    correo: '',
    roles:[],
    permisos:[], 
}
const initialState: AuthState = {
    status: 'checking',
    user: user,
    errorMessage: undefined
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        onChecking: (state) => {
            state.status = 'checking';
            state.user = user;
            state.errorMessage = undefined;
        },
        onLogin: (state, { payload }: PayloadAction<User>) => {
            state.status = 'authenticated';
            state.user = payload;
            state.errorMessage = undefined;
        },
        onLogout: (state, { payload }: PayloadAction<String|undefined>) => { //duda con el tipo del payload para errorMessage
            state.status = 'not-authenticated';
            state.user = user;
            state.errorMessage = payload;
        },
        clearErrorMessage: (state) => {
            state.errorMessage = undefined;
        }
    },
})

// Action creators are generated for each case reducer function
export const { onChecking, onLogin, onLogout, clearErrorMessage } = authSlice.actions

