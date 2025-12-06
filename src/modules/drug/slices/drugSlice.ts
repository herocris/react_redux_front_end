import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { Drug, DrugState } from '../';

const drug: Drug = {
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
const initialState: DrugState = {
    drugs: [],
    activeDrug: drug,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const drugSlice = createSlice({
    name: 'drug',
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
        clearActiveDrug: (state) => {
            state.activeDrug = drug;
        },
        onSetActiveDrug: (state, { payload }: PayloadAction<Drug>) => {
            state.activeDrug = payload;
        },
        setDrugs: (state, { payload }: PayloadAction<Drug[]>) => {
            state.drugs = payload;
        },

        onAddNewDrug: (state, { payload }: PayloadAction<Drug>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.drugs = [...state.drugs, payload];
            state.activeDrug = drug;
        },
        onUpdateDrug: (state, { payload }: PayloadAction<Drug>) => {
            state.drugs = state.drugs.map(drug => {
                if (drug.id === payload.id) {
                    return payload;
                }
                return drug;
            });
            state.activeDrug = drug;
        },
        onDeleteDrug: (state, { payload }: PayloadAction<string>) => {
            if (state.activeDrug) {
                state.drugs = state.drugs.filter(drug => drug.id !== payload);
                state.activeDrug = drug;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveDrug, setDrugs, onSetActiveDrug, onAddNewDrug, onUpdateDrug, onDeleteDrug, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = drugSlice.actions

