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
    activeAmmunitionConfiscation: AmmunitionConfiscation
    handleOpen: Function
    onSaveOrUptdate: Function
    ammunitionCollection: SelectOptions[]
    handleOpenDialog: Function
}