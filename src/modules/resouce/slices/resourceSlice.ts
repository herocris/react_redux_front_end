import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { SelectOptions} from '../../../shared/interfaces/sharedInterfaces';
import { ResourceState } from '../';


const initialState: ResourceState = {
    rolesCollection: [],
    permisosCollection: [],
    drugCollection:[],
    drugPresentationCollection:[],
    weaponCollection:[],
    ammunitionCollection:[],
    loading: false
}

export const resourceSlice = createSlice({
    name: 'resource',
    initialState,
    reducers: {
        onLoading: (state, { payload }: PayloadAction<boolean>) => {
            state.loading = payload;
        },
        setRoles: (state, { payload }: PayloadAction<SelectOptions[]>) => {
            state.rolesCollection = payload;
        },
        setPermissions: (state, { payload }: PayloadAction<SelectOptions[]>) => {
            state.permisosCollection = payload;
        },
        setDrugs: (state, { payload }: PayloadAction<SelectOptions[]>) => {
            state.drugCollection = payload;
        },
        setDrugPresentations: (state, { payload }: PayloadAction<SelectOptions[]>) => {
            state.drugPresentationCollection = payload;
        },
        setWeapons: (state, { payload }: PayloadAction<SelectOptions[]>) => {
            state.weaponCollection = payload;
        },
        setAmmunitions: (state, { payload }: PayloadAction<SelectOptions[]>) => {
            state.ammunitionCollection = payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setRoles, setPermissions,setDrugs,setDrugPresentations,setWeapons,setAmmunitions, onLoading } = resourceSlice.actions

