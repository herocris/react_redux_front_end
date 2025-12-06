import { createSlice,PayloadAction } from '@reduxjs/toolkit'
import { MapState, MapItem } from '../';

const initialState: MapState = {
    Mapitems: [],
    loading: false,
    errorMessage: {}
}

export const mapSlice = createSlice({
    name: 'map',
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
        setMapitems: (state, { payload }: PayloadAction<MapItem[]>) => {
            state.Mapitems = payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setMapitems, onLoading, onSetErrorMessage, onClearErrorMessage } = mapSlice.actions

