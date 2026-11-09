import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppliedAnalysisFilters } from '../types';

const initialState: AppliedAnalysisFilters = {
    start_date: '',
    end_date: '',
    drugs: [],
    weapons: [],
    ammunitions: [],
};

export const analysisFiltersSlice = createSlice({
    name: 'analysisFilters',
    initialState,
    reducers: {
        applyAnalysisFilters: (_state, { payload }: PayloadAction<AppliedAnalysisFilters>) => ({
            start_date: payload.start_date,
            end_date: payload.end_date,
            drugs: [...payload.drugs],
            weapons: [...payload.weapons],
            ammunitions: [...payload.ammunitions],
        }),
        resetAnalysisFilters: () => initialState,
    },
    selectors: {
        selectAppliedAnalysisFilters: state => state,
    },
});

export const { applyAnalysisFilters, resetAnalysisFilters } = analysisFiltersSlice.actions;
export const { selectAppliedAnalysisFilters } = analysisFiltersSlice.selectors;
