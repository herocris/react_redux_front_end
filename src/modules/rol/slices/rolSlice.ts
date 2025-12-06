import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { Role,RoleState } from '../';


const role: Role = {
    nombre: '',
    permisos:[]
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
const initialState: RoleState = {
    roles: [],
    activeRole: role,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const roleSlice = createSlice({
    name: 'role',
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
        clearActiveRole: (state) => {
            state.activeRole = role;
        },
        onSetActiveRole: (state, { payload }: PayloadAction<Role>) => {
            state.activeRole = payload;
        },
        setRoles: (state, { payload }: PayloadAction<Role[]>) => {
            state.roles = payload;
        },

        onAddNewRole: (state, { payload }: PayloadAction<Role>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.roles = [...state.roles, payload];
            state.activeRole = role;
        },
        onUpdateRole: (state, { payload }: PayloadAction<Role>) => {
            state.roles = state.roles.map(role => {
                if (role.id === payload.id) {
                    return payload;
                }
                return role;
            });
            state.activeRole = role;
        },
        onDeleteRol: (state, { payload }: PayloadAction<string>) => {
            if (state.activeRole) {
                state.roles = state.roles.filter(role => role.id !== payload);
                state.activeRole = role;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveRole, setRoles, onSetActiveRole, onAddNewRole, onUpdateRole, onDeleteRol, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = roleSlice.actions

