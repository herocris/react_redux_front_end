import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { TableOptions} from '../../../shared/interfaces/sharedInterfaces';
import { Confiscation, ConfiscationState } from '../';

const confiscation: Confiscation = {
    fecha: '',
    observacion: '',
    direccion: '',
    departamento: '',
    municipalidad: '',
    latitud: 51.505,
    longitud: -0.09,
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
const initialState: ConfiscationState = {
    confiscations: [],
    activeConfiscation: confiscation,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const confiscationSlice = createSlice({
    name: 'confiscation',
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
        clearActiveConfiscation: (state) => {
            state.activeConfiscation = confiscation;
        },
        onSetActiveConfiscation: (state, { payload }: PayloadAction<Confiscation>) => {
            state.activeConfiscation = payload;
        },
        setConfiscations: (state, { payload }: PayloadAction<Confiscation[]>) => {
            state.confiscations = payload;
        },

        onAddNewConfiscation: (state, { payload }: PayloadAction<Confiscation>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.confiscations = [...state.confiscations, payload];
            state.activeConfiscation = confiscation;
        },
        onUpdateConfiscation: (state, { payload }: PayloadAction<Confiscation>) => {
            state.confiscations = state.confiscations.map(confiscation => {
                if (confiscation.id === payload.id) {
                    return payload;
                }
                return confiscation;
            });
            state.activeConfiscation = payload;
        },
        onDeleteConfiscation: (state, { payload }: PayloadAction<string>) => {
            if (state.activeConfiscation) {
                state.confiscations = state.confiscations.filter(confiscation => confiscation.id !== payload);
                state.activeConfiscation = confiscation;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveConfiscation, setConfiscations, onSetActiveConfiscation, onAddNewConfiscation, onUpdateConfiscation, onDeleteConfiscation, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = confiscationSlice.actions

