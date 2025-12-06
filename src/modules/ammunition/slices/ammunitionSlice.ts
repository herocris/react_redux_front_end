import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { Ammunition, AmmunitionState } from '../';

const ammunition: Ammunition = {
    descripcion: '',
    logo: ''
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
const initialState: AmmunitionState = {
    ammunitions: [],
    activeAmmunition: ammunition,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const ammunitionSlice = createSlice({
    name: 'ammunition',
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
        clearActiveAmmunition: (state) => {
            state.activeAmmunition = ammunition;
        },
        onSetActiveAmmunition: (state, { payload }: PayloadAction<Ammunition>) => {
            state.activeAmmunition = payload;
        },
        setAmmunitions: (state, { payload }: PayloadAction<Ammunition[]>) => {
            state.ammunitions = payload;
        },

        onAddNewAmmunition: (state, { payload }: PayloadAction<Ammunition>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.ammunitions = [...state.ammunitions, payload];
            state.activeAmmunition = ammunition;
        },
        onUpdateAmmunition: (state, { payload }: PayloadAction<Ammunition>) => {
            state.ammunitions = state.ammunitions.map(ammunition => {
                if (ammunition.id === payload.id) {
                    return payload;
                }
                return ammunition;
            });
            state.activeAmmunition = ammunition;
        },
        onDeleteAmmunition: (state, { payload }: PayloadAction<string>) => {
            if (state.activeAmmunition) {
                state.ammunitions = state.ammunitions.filter(ammunition => ammunition.id !== payload);
                state.activeAmmunition = ammunition;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveAmmunition, setAmmunitions, onSetActiveAmmunition, onAddNewAmmunition, onUpdateAmmunition, onDeleteAmmunition, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = ammunitionSlice.actions

