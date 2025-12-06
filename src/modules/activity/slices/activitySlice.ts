import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { Activity, ActivityState } from '../';

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
const initialState: ActivityState = {
    activities: [],
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const activitySlice = createSlice({
    name: 'activities',
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
        setPermissions: (state, { payload }: PayloadAction<Activity[]>) => {
            state.activities = payload;
        },


    },
})

// Action creators are generated for each case reducer function
export const { setPermissions, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = activitySlice.actions

