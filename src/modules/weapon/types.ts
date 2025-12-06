import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Weapon {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}

export interface WeaponState {
    weapons: Weapon[],
    activeWeapon: Weapon,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface WeaponFormModalProps {
    handleOpen: Function;
    loading: boolean
    activeWeapon: Weapon
    onSaveOrUptdate: Function
    errorMessage: object | string
}