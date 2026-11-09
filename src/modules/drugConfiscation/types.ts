import type { OptionsStatus } from '../resouce/queries/optionsStatus';
import { SelectOptions, TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface DrugConfiscation {
    identificador?: string,
    cantidad: number,
    peso: number,
    decomiso: number,
    droga: number,
    droga_nombre?: string,
    presentacion: number,
    presentacion_nombre?: string,
    foto: string | File
}

export interface DrugConfiscationState {
    drugConfiscations: DrugConfiscation[],
    activeDrugConfiscation: DrugConfiscation,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface DrugConfiscationFormProps {
    busy?: boolean
    optionsStatus: OptionsStatus
    activeDrugConfiscation: DrugConfiscation
    handleOpen: (open: boolean) => void
    onSaveOrUptdate: (data: DrugConfiscation) => Promise<void>
    drugCollection: SelectOptions[]
    drugPresentationCollection: SelectOptions[]
    handleOpenDialog: () => void
}