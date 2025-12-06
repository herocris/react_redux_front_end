import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { DrugPresentation, DrugPresentationState } from '../';


const drugPresentation: DrugPresentation = {
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
const initialState: DrugPresentationState = {
    drugPresentations: [],
    activeDrugPresentation: drugPresentation,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const drugPresentationSlice = createSlice({
    name: 'drugPresentation',
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
        clearActiveDrugPresentation: (state) => {
            state.activeDrugPresentation = drugPresentation;
        },
        onSetActiveDrugPresentation: (state, { payload }: PayloadAction<DrugPresentation>) => {
            state.activeDrugPresentation = payload;
        },
        setDrugPresentations: (state, { payload }: PayloadAction<DrugPresentation[]>) => {
            state.drugPresentations = payload;
        },

        onAddNewDrugPresentation: (state, { payload }: PayloadAction<DrugPresentation>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.drugPresentations = [...state.drugPresentations, payload];
            state.activeDrugPresentation = drugPresentation;
        },
        onUpdateDrugPresentation: (state, { payload }: PayloadAction<DrugPresentation>) => {
            state.drugPresentations = state.drugPresentations.map(drugPresentation => {
                if (drugPresentation.id === payload.id) {
                    return payload;
                }
                return drugPresentation;
            });
            state.activeDrugPresentation = drugPresentation;
        },
        onDeleteDrugPresentation: (state, { payload }: PayloadAction<string>) => {
            if (state.activeDrugPresentation) {
                state.drugPresentations = state.drugPresentations.filter(drugPresentation => drugPresentation.id !== payload);
                state.activeDrugPresentation = drugPresentation;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveDrugPresentation, setDrugPresentations, onSetActiveDrugPresentation, onAddNewDrugPresentation, onUpdateDrugPresentation, onDeleteDrugPresentation, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = drugPresentationSlice.actions

