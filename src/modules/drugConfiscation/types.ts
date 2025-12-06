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
    activeDrugConfiscation: DrugConfiscation
    handleOpen: Function
    onSaveOrUptdate: Function
    drugCollection: SelectOptions[]
    drugPresentationCollection: SelectOptions[]
    handleOpenDialog: Function
}