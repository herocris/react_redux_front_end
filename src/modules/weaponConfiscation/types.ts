import { SelectOptions, TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface WeaponConfiscation {
    identificador?: string,
    cantidad: number,
    decomiso: number,
    arma: number,
    arma_nombre?: string,
    foto: string | File
}
export interface WeaponConfiscationState {
    weaponConfiscations: WeaponConfiscation[],
    activeWeaponConfiscation: WeaponConfiscation,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface WeaponConfiscationFormProps {
    activeWeaponConfiscation: WeaponConfiscation
    handleOpen: Function
    onSaveOrUptdate: Function
    weaponCollection: SelectOptions[]
    handleOpenDialog: Function
}