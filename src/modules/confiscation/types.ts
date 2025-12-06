import { FieldErrors } from "react-hook-form"
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Confiscation {
    id?: string,
    identificador?: string,
    fecha: string,
    observacion: string,
    direccion: string,
    departamento: string,
    municipalidad: string,
    latitud: number,
    longitud: number,
}

export interface ConfiscationState {
    confiscations: Confiscation[],
    activeConfiscation: Confiscation,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface ConfiscationMapModalProps {
    handleOpen: Function
    lat: number,
    lng: number,
    nameLat: string,
    nameLng: string,
    nameDepto: string,
    nameMuni: string,
    control: any
}

export interface FieldsFormProps {
    handleSubmit: Function
    onSubmit: Function
    loading: boolean
    register: Function
    errors: FieldErrors
    handleOpenMap: Function
    control: any
}