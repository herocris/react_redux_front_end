import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setRoles, onLoading, setPermissions,setDrugs,setDrugPresentations, setWeapons,setAmmunitions } from '../slices';
import { Permission } from '../../permission';
import { Drug } from '../../drug';
import { Ammunition } from '../../ammunition';
import { Weapon } from '../../weapon';
import { Role } from '../../rol';

export const startLoadingRoles = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data: { data } } = await calendarApi.get('/role');
            const roles = data.map((role: Role) => ({
                value:role.identificador,
                description:role.nombre
            }))
            dispatch(setRoles(roles));
            dispatch(onLoading(false));

        } catch (error) {
            // dispatch( onLogout('Registro incorrecto') );
            // setTimeout(() => {
            //     dispatch( clearErrorMessage() );
            // }, 2000);
            console.log(error);

        }
    }
}

export const startLoadingPermissions = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data: { data } } = await calendarApi.get('/permission');
            const permissions = data.map((permission: Permission) => ({
                value:permission.identificador,
                description:permission.nombre
            }))
            dispatch(setPermissions(permissions));
            dispatch(onLoading(false));

        } catch (error) {
            // dispatch( onLogout('Registro incorrecto') );
            // setTimeout(() => {
            //     dispatch( clearErrorMessage() );
            // }, 2000);
            console.log('hubo un error');

        }
    }
}
export const startLoadingDrugNames = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data: { data } } = await calendarApi.get('/drug');
            const drugs = data.map((drug: Drug) => ({
                value:drug.identificador,
                description:drug.descripcion
            }))
            dispatch(setDrugs(drugs));
            dispatch(onLoading(false));

        } catch (error) {
            // dispatch( onLogout('Registro incorrecto') );
            // setTimeout(() => {
            //     dispatch( clearErrorMessage() );
            // }, 2000);
            console.log('hubo un error');

        }
    }
}
export const startLoadingDrugPresentationNames = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data: { data } } = await calendarApi.get('/drugPresentation');
            const presentations = data.map((presentation: Drug) => ({
                value:presentation.identificador,
                description:presentation.descripcion
            }));
            
            dispatch(setDrugPresentations(presentations));
            dispatch(onLoading(false));

        } catch (error) {
            // dispatch( onLogout('Registro incorrecto') );
            // setTimeout(() => {
            //     dispatch( clearErrorMessage() );
            // }, 2000);
            console.log('hubo un error');

        }
    }
}

export const startLoadingWeaponNames = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data: { data } } = await calendarApi.get('/weapon');
            const weapons = data.map((weapon: Weapon) => ({
                value:weapon.identificador,
                description:weapon.descripcion
            }));
            dispatch(setWeapons(weapons));
            dispatch(onLoading(false));

        } catch (error) {
            // dispatch( onLogout('Registro incorrecto') );
            // setTimeout(() => {
            //     dispatch( clearErrorMessage() );
            // }, 2000);
            console.log('hubo un error');

        }
    }
}
export const startLoadingAmmunitionNames = () => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data: { data } } = await calendarApi.get('/ammunition');
            const ammunitions = data.map((ammunition: Ammunition) => ({
                value:ammunition.identificador,
                description:ammunition.descripcion
            }));
            dispatch(setAmmunitions(ammunitions));
            dispatch(onLoading(false));

        } catch (error) {
            // dispatch( onLogout('Registro incorrecto') );
            // setTimeout(() => {
            //     dispatch( clearErrorMessage() );
            // }, 2000);
            console.log('hubo un error');

        }
    }
}
