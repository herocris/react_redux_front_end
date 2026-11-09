import type { OptionsStatus } from '../resouce/queries/optionsStatus';
import { SelectOptions, TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface AmmunitionConfiscation {
    identificador?: string,
    cantidad: number,
    decomiso: number,
    municion: number,
    municion_nombre?: string,
    foto: string | File
}
export interface AmmunitionConfiscationState {
    ammunitionConfiscations: AmmunitionConfiscation[],
    activeAmmunitionConfiscation: AmmunitionConfiscation,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface AmmunitionConfiscationFormProps {
    optionsStatus: OptionsStatus
    activeAmmunitionConfiscation: AmmunitionConfiscation
    handleOpen: Function
    onSaveOrUptdate: (data: AmmunitionConfiscation) => Promise<void>
    ammunitionCollection: SelectOptions[]
    handleOpenDialog: Function
}