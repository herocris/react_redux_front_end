import type { OptionsStatus } from '../resouce/queries/optionsStatus';
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
    busy?: boolean
    optionsStatus: OptionsStatus
    activeWeaponConfiscation: WeaponConfiscation
    handleOpen: (open: boolean) => void
    onSaveOrUptdate: (data: WeaponConfiscation) => Promise<void>
    weaponCollection: SelectOptions[]
    handleOpenDialog: () => void
}