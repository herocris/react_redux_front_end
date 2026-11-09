import type { OptionsStatus } from '../resouce/queries/optionsStatus';
import { SelectOptions } from "../../shared/interfaces/sharedInterfaces"

export interface AmmunitionConfiscation {
    identificador?: string,
    cantidad: number,
    decomiso: number,
    municion: number,
    municion_nombre?: string,
    foto: string | File
}
export interface AmmunitionConfiscationFormProps {
    busy?: boolean
    optionsStatus: OptionsStatus
    activeAmmunitionConfiscation: AmmunitionConfiscation
    handleOpen: (open: boolean) => void
    onSaveOrUptdate: (data: AmmunitionConfiscation) => Promise<void>
    ammunitionCollection: SelectOptions[]
    handleOpenDialog: () => void
}