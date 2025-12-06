import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { AmmunitionConfiscation, AmmunitionConfiscationState } from '../';



const ammunitionConfiscation: AmmunitionConfiscation = {
    cantidad: 0,
    decomiso: 0,
    municion: 0,
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
const initialState: AmmunitionConfiscationState = {
    ammunitionConfiscations: [],
    activeAmmunitionConfiscation: ammunitionConfiscation,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const ammunitionConfiscationSlice = createSlice({
    name: 'ammunitionConfiscation',
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
        clearActiveAmmunitionConfiscation: (state) => {
            state.activeAmmunitionConfiscation = ammunitionConfiscation;
        },
        onSetActiveAmmunitionConfiscation: (state, { payload }: PayloadAction<AmmunitionConfiscation>) => {
            state.activeAmmunitionConfiscation = payload;
        },
        setAmmunitionConfiscations: (state, { payload }: PayloadAction<AmmunitionConfiscation[]>) => {
            state.ammunitionConfiscations = payload;
        },

        onAddNewAmmunitionConfiscation: (state, { payload }: PayloadAction<AmmunitionConfiscation>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.ammunitionConfiscations = [...state.ammunitionConfiscations, payload];
            state.activeAmmunitionConfiscation = ammunitionConfiscation;
        },
        onUpdateAmmunitionConfiscation: (state, { payload }: PayloadAction<AmmunitionConfiscation>) => {
            state.ammunitionConfiscations = state.ammunitionConfiscations.map(ammunitionConfiscation => {
                if (ammunitionConfiscation.identificador === payload.identificador) {
                    return payload;
                }
                return ammunitionConfiscation;
            });
            state.activeAmmunitionConfiscation = ammunitionConfiscation;
        },
        onDeleteAmmunitionConfiscation: (state, { payload }: PayloadAction<string>) => {
            if (state.activeAmmunitionConfiscation) {
                state.ammunitionConfiscations = state.ammunitionConfiscations.filter(ammunitionConfiscation => ammunitionConfiscation.identificador !== payload);
                state.activeAmmunitionConfiscation = ammunitionConfiscation;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveAmmunitionConfiscation, setAmmunitionConfiscations, onSetActiveAmmunitionConfiscation, onAddNewAmmunitionConfiscation, onUpdateAmmunitionConfiscation, onDeleteAmmunitionConfiscation, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = ammunitionConfiscationSlice.actions

