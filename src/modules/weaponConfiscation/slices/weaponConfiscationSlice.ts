import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { WeaponConfiscation, WeaponConfiscationState } from '../';

const weaponConfiscation: WeaponConfiscation = {
    cantidad: 0,
    decomiso: 0,
    arma: 0,
    foto: ''
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
const initialState: WeaponConfiscationState = {
    weaponConfiscations: [],
    activeWeaponConfiscation: weaponConfiscation,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const weaponConfiscationSlice = createSlice({
    name: 'weaponConfiscation',
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
        clearActiveWeaponConfiscation: (state) => {
            state.activeWeaponConfiscation = weaponConfiscation;
        },
        onSetActiveWeaponConfiscation: (state, { payload }: PayloadAction<WeaponConfiscation>) => {
            state.activeWeaponConfiscation = payload;
        },
        setWeaponConfiscations: (state, { payload }: PayloadAction<WeaponConfiscation[]>) => {
            state.weaponConfiscations = payload;
        },

        onAddNewWeaponConfiscation: (state, { payload }: PayloadAction<WeaponConfiscation>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.weaponConfiscations = [...state.weaponConfiscations, payload];
            state.activeWeaponConfiscation = weaponConfiscation;
        },
        onUpdateWeaponConfiscation: (state, { payload }: PayloadAction<WeaponConfiscation>) => {
            state.weaponConfiscations = state.weaponConfiscations.map(weaponConfiscation => {
                if (weaponConfiscation.identificador === payload.identificador) {
                    return payload;
                }
                return weaponConfiscation;
            });
            state.activeWeaponConfiscation = weaponConfiscation;
        },
        onDeleteWeaponConfiscation: (state, { payload }: PayloadAction<string>) => {
            if (state.activeWeaponConfiscation) {
                state.weaponConfiscations = state.weaponConfiscations.filter(weaponConfiscation => weaponConfiscation.identificador !== payload);
                state.activeWeaponConfiscation = weaponConfiscation;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveWeaponConfiscation, setWeaponConfiscations, onSetActiveWeaponConfiscation, onAddNewWeaponConfiscation, onUpdateWeaponConfiscation, onDeleteWeaponConfiscation, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = weaponConfiscationSlice.actions

