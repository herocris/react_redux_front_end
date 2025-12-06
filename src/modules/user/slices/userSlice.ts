import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { User, UserState } from '../types';


const user: User = {
    nombre: '',
    correo: '',
    password: '',
    permisos:[],
    roles:[]
}

const tableOptions: TableOptions = {
    current_page: 1,
    first_page_url: '',
    from: 0,
    last_page: 0,
    last_page_url: '',
    links: [],
    next_page_url: '',
    path: '',
    per_page: 10,
    prev_page_url: '',
    to: 0,
    total: 0,
    orderBy: '',
    order: '',
    filterValue: ''
}
const initialState: UserState = {
    users: [],
    activeUser: user,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        onSetErrorMessage: (state, { payload }: PayloadAction<object>) => {
            state.errorMessage = payload;
        },
        onClearErrorMessage: (state) => {
            state.errorMessage = {};
        },
        onLoading: (state, { payload }: PayloadAction<boolean>) => {
            state.loading = payload;
        },
        onSetTableOptions: (state, { payload }: PayloadAction<TableOptions>) => {
            state.tableOptions = payload;
        },
        clearActiveUser: (state) => {
            state.activeUser = user;
        },
        onSetActiveUser: (state, { payload }: PayloadAction<User>) => {
            state.activeUser = payload;
        },
        setUsers: (state, { payload }: PayloadAction<User[]>) => {
            state.users = payload;
        },

        onAddNewUser: (state, { payload }: PayloadAction<User>) => {
            //state.users.push( {...payload,id:payload.identificador} );
            state.users = [...state.users, payload];
            state.activeUser = user;
        },
        onUpdateUser: (state, { payload }: PayloadAction<User>) => {
            state.users = state.users.map(user => {
                if (user.id === payload.id) {
                    return payload;
                }
                return user;
            });
            state.activeUser = user;
        },
        onDeleteUser: (state, { payload }: PayloadAction<string>) => {
            if (state.activeUser) {
                state.users = state.users.filter(user => user.id !== payload);
                state.activeUser = user;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveUser, setUsers, onSetActiveUser, onAddNewUser, onUpdateUser, onDeleteUser, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = userSlice.actions

