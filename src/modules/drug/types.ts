import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Drug {
    id?: string,
    identificador?: string,
    descripcion: string,
    logo: string | File
}

export interface DrugState {
    drugs: Drug[],
    activeDrug: Drug,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface DrugFormModalProps {
    handleOpen: Function;
    loading: boolean
    activeDrug: Drug
    onSaveOrUptdate: Function
    errorMessage: object | string
}