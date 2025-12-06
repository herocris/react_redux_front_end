import { Dispatch } from '@reduxjs/toolkit';
import calendarApi from '../../../api/graphdataApi';
import { setWeaponConfiscations, onAddNewWeaponConfiscation, onUpdateWeaponConfiscation, onDeleteWeaponConfiscation, onSetTableOptions, onLoading, onSetErrorMessage } from '../slices';
import { WeaponConfiscation } from '..';


export const startLoadingWeaponConfiscations = (idConfiscation: number, page: number, sortBy: string, orderType: string, per_page: number, search_by: string, valueSearch: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        sortBy = sortBy === 'id' ? 'identificador' : sortBy;
        try {
            const { data: { data, ...optionsTable } } = await calendarApi.get(`/weaponConfiscation/${idConfiscation}/confiscation?page=${page}&sort_by=${sortBy}&type=${orderType}&per_page=${per_page}&${search_by}=${valueSearch}`);
            const weaponConfiscations = data.map((weaponConfiscation: any) => {
                const { decomiso, arma, ...resto } = weaponConfiscation;
                return { decomiso: decomiso.identificador, arma: arma.identificador, arma_nombre: arma.descripcion, ...resto }
            })
            //console.log(weaponConfiscations);

            dispatch(onSetTableOptions(optionsTable));
            dispatch(setWeaponConfiscations(weaponConfiscations));
        } catch (error) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startSaveWeaponConfiscation = (weaponConfiscation: WeaponConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            const { data } = await calendarApi.post('/weaponConfiscation', weaponConfiscation, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            //const { identificador: id, ...resto } = data;
            const { decomiso, arma, ...resto } = data;
            dispatch(onAddNewWeaponConfiscation({ decomiso: decomiso.identificador, arma: arma.identificador, arma_nombre: arma.descripcion, ...resto }))
        }
        catch (error: any) {
            console.log(error);
            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startUpdateWeaponConfiscation = (weaponConfiscation: WeaponConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));

        const formData = new FormData();
        formData.append('cantidad', weaponConfiscation.cantidad.toString());
        formData.append('decomiso', weaponConfiscation.decomiso.toString());
        formData.append('arma', weaponConfiscation.arma.toString());
        // Si el archivo existe (por ejemplo, desde tu componente PhotoInput)
        if (weaponConfiscation.foto instanceof File) {
            formData.append('foto', weaponConfiscation.foto);
        }
        // Si quieres enviar un método PUT (Laravel lo reconocerá si el form usa POST):
        formData.append('_method', 'PUT');

        try {
            const { data } = await calendarApi.post(`/weaponConfiscation/${weaponConfiscation.identificador}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const { decomiso, arma, ...resto } = data;
            dispatch(onUpdateWeaponConfiscation({ decomiso: decomiso.identificador, arma: arma.identificador, arma_nombre: arma.descripcion, ...resto }))
        } catch (error: any) {
            console.log(error);

            return handleApiError(error, dispatch);
        } finally {
            dispatch(onLoading(false));
        }
    }
}

export const startDeleteWeaponConfiscation = (weaponConfiscation: WeaponConfiscation) => {
    return async (dispatch: Dispatch) => {
        dispatch(onLoading(true));
        try {
            await calendarApi.delete(`/weaponConfiscation/${weaponConfiscation.identificador}`,);
            dispatch(onDeleteWeaponConfiscation(weaponConfiscation.identificador as string))
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

