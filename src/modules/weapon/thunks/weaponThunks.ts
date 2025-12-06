import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setWeapons, onAddNewWeapon, onUpdateWeapon, onDeleteWeapon, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { Weapon } from '../';


export const startLoadingWeapons = (page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/weapon?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const weapons = data.map((weapon: Weapon) => {
                const { identificador: id, ...resto } = weapon;
                return { id, ...resto }
            })
            dispatch(onSetTableOptions(optionsTable));
            dispatch(setWeapons(weapons));
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveWeapon = (weapon: Weapon) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/weapon', weapon, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onAddNewWeapon({ id, ...resto }))
        }
        catch (error: any) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateWeapon = (weapon: Weapon) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        const formData = new FormData();
        formData.append('descripcion', weapon.descripcion);
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (weapon.logo instanceof File) {
            formData.append('logo', weapon.logo);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');

        try {
            const { data } = await calendarApi.post(`/weapon/${weapon.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { identificador: id, ...resto } = data;
            dispatch(onUpdateWeapon({ id, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteWeapon = (weapon: Weapon) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/weapon/${weapon.id}`,);
            dispatch(onDeleteWeapon(weapon.id as string))
        } catch (error) {
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

const handleApiError = (error: any, dispatch: Dispatch) => {
    if (error?.hasOwnProperty('error')) {
        dispatch(onSetErrorMessage(error.error));
    }
    return Promise.reject();
};

