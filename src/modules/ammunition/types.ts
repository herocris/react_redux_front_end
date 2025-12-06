import { TableOptions } from "../../shared/interfaces/sharedInterfaces";

export interface Ammunition {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}
export interface AmmunitionState {
    ammunitions: Ammunition[],
    activeAmmunition: Ammunition,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}
export interface AmmunitionFormModalProps {
    handleOpen: Function;
    loading: boolean
    activeAmmunition: Ammunition
    onSaveOrUptdate: Function
    errorMessage: object | string
}