import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PieGraph,BarLineGraph, GraphState } from '../types';

const initialState: GraphState = {
    barLineGraph: [],
    pieGraph: [],
    loading: false,
    errorMessage: {}
}

export const graphSlice = createSlice({
    name: 'graph',
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
        setBarLineGraphs: (state, { payload }: PayloadAction<BarLineGraph[]>) => {
            state.barLineGraph = payload;
        },
        setPieGraphs: (state, { payload }: PayloadAction<PieGraph[]>) => {
            state.pieGraph = payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setBarLineGraphs, setPieGraphs, onLoading, onSetErrorMessage, onClearErrorMessage } = graphSlice.actions

