import type { OptionsStatus } from '../resouce/queries/optionsStatus';
import { SelectOptions } from "../../shared/interfaces/sharedInterfaces"

export interface WeaponConfiscation {
    identificador?: string,
    cantidad: number,
    decomiso: number,
    arma: number,
    arma_nombre?: string,
    foto: string | File
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