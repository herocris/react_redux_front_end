import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { DrugConfiscation, DrugConfiscationState } from '../';

const drugConfiscation: DrugConfiscation = {
    cantidad: 0,
    peso: 0,
    decomiso: 0,
    droga: 0,
    presentacion: 0,
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
const initialState: DrugConfiscationState = {
    drugConfiscations: [],
    activeDrugConfiscation: drugConfiscation,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const drugConfiscationSlice = createSlice({
    name: 'drugConfiscation',
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
        clearActiveDrugConfiscation: (state) => {
            state.activeDrugConfiscation = drugConfiscation;
        },
        onSetActiveDrugConfiscation: (state, { payload }: PayloadAction<DrugConfiscation>) => {
            state.activeDrugConfiscation = payload;
        },
        setDrugConfiscations: (state, { payload }: PayloadAction<DrugConfiscation[]>) => {
            state.drugConfiscations = payload;
        },

        onAddNewDrugConfiscation: (state, { payload }: PayloadAction<DrugConfiscation>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.drugConfiscations = [...state.drugConfiscations, payload];
            state.activeDrugConfiscation = drugConfiscation;
        },
        onUpdateDrugConfiscation: (state, { payload }: PayloadAction<DrugConfiscation>) => {
            state.drugConfiscations = state.drugConfiscations.map(drugConfiscation => {
                if (drugConfiscation.identificador === payload.identificador) {
                    return payload;
                }
                return drugConfiscation;
            });
            state.activeDrugConfiscation = drugConfiscation;
        },
        onDeleteDrugConfiscation: (state, { payload }: PayloadAction<string>) => {
            if (state.activeDrugConfiscation) {
                state.drugConfiscations = state.drugConfiscations.filter(drugConfiscation => drugConfiscation.identificador !== payload);
                state.activeDrugConfiscation = drugConfiscation;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveDrugConfiscation, setDrugConfiscations, onSetActiveDrugConfiscation, onAddNewDrugConfiscation, onUpdateDrugConfiscation, onDeleteDrugConfiscation, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = drugConfiscationSlice.actions

