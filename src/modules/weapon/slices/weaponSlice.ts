import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TableOptions } from '../../../shared/interfaces/sharedInterfaces';
import { Weapon, WeaponState } from '../';

const weapon: Weapon = {
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
const initialState: WeaponState = {
    weapons: [],
    activeWeapon: weapon,
    tableOptions: tableOptions,
    loading: false,
    errorMessage: {}
}

export const weaponSlice = createSlice({
    name: 'weapon',
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
        clearActiveWeapon: (state) => {
            state.activeWeapon = weapon;
        },
        onSetActiveWeapon: (state, { payload }: PayloadAction<Weapon>) => {
            state.activeWeapon = payload;
        },
        setWeapons: (state, { payload }: PayloadAction<Weapon[]>) => {
            state.weapons = payload;
        },

        onAddNewWeapon: (state, { payload }: PayloadAction<Weapon>) => {
            //state.Roles.push( {...payload,id:payload.identificador} );
            state.weapons = [...state.weapons, payload];
            state.activeWeapon = weapon;
        },
        onUpdateWeapon: (state, { payload }: PayloadAction<Weapon>) => {
            state.weapons = state.weapons.map(weapon => {
                if (weapon.id === payload.id) {
                    return payload;
                }
                return weapon;
            });
            state.activeWeapon = weapon;
        },
        onDeleteWeapon: (state, { payload }: PayloadAction<string>) => {
            if (state.activeWeapon) {
                state.weapons = state.weapons.filter(weapon => weapon.id !== payload);
                state.activeWeapon = weapon;
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const { clearActiveWeapon, setWeapons, onSetActiveWeapon, onAddNewWeapon, onUpdateWeapon, onDeleteWeapon, onSetTableOptions, onLoading, onSetErrorMessage, onClearErrorMessage } = weaponSlice.actions

