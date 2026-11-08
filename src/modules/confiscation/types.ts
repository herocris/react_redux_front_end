import { Control, FieldErrors } from "react-hook-form"
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
    handleOpen: (open: boolean) => void
    lat: number,
    lng: number,
    nameLat: 'latitud',
    nameLng: 'longitud',
    nameDepto: 'departamento',
    nameMuni: 'municipalidad',
    control: Control<Omit<Confiscation, 'id'>>
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
