import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface DrugPresentation {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}

export interface DrugPresentationState {
    drugPresentations: DrugPresentation[],
    activeDrugPresentation: DrugPresentation,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface DrugPresentationFormModalProps {
    handleOpen: Function;
    loading: boolean
    activeDrugPresentation: DrugPresentation
    onSaveOrUptdate: Function
    errorMessage: object | string
}