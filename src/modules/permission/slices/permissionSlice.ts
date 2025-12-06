import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { TableOptions} from '../../../shared/interfaces/sharedInterfaces';
import { Permission, PermissionState } from '../';

const permission: Permission = {
    nombre: '',
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
const initialState: PermissionState = {
    permissions: [],
    activePermission: permission,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const permissionSlice = createSlice({
    name: 'permission',
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
        clearActivePermission: (state) => {
            state.activePermission = permission;
        },
        onSetActivePermission: (state, { payload }: PayloadAction<Permission>) => {
            state.activePermission = payload;
        },
        setPermissions: (state, { payload }: PayloadAction<Permission[]>) => {
            state.permissions = payload;
        },

        onAddNewPermission: (state, { payload }: PayloadAction<Permission>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.permissions = [...state.permissions, payload];
            state.activePermission = permission;
        },
        onUpdatePermission: (state, { payload }: PayloadAction<Permission>) => {
            state.permissions = state.permissions.map(permission => {
                if (permission.id === payload.id) {
                    return payload;
                }
                return permission;
            });
            state.activePermission = permission;
        },
        onDeletePermission: (state, { payload }: PayloadAction<string>) => {
            if (state.activePermission) {
                state.permissions = state.permissions.filter(rol => rol.id !== payload);
                state.activePermission = permission;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActivePermission, setPermissions, onSetActivePermission, onAddNewPermission, onUpdatePermission, onDeletePermission, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = permissionSlice.actions

