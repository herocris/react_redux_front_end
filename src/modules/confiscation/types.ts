import { Control, FieldErrors } from "react-hook-form"
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"
import type { z } from 'zod';
import type { confiscationSchema } from './validators';

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
    control: Control<z.input<typeof confiscationSchema>, unknown, z.output<typeof confiscationSchema>>
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
