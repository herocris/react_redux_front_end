import type { Control, FieldErrors, SubmitHandler, UseFormHandleSubmit, UseFormRegister } from "react-hook-form"
import type { z } from 'zod';
import type { confiscationSchema } from './validators';
import type { Ref } from 'react';

export interface Confiscation {
    id?: number,
    identificador?: number,
    fecha: string,
    observacion: string,
    direccion: string,
    departamento: string,
    municipalidad: string,
    latitud: number,
    longitud: number,
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
    locationButtonRef?: Ref<HTMLButtonElement>
    handleSubmit: UseFormHandleSubmit<z.input<typeof confiscationSchema>, z.output<typeof confiscationSchema>>
    onSubmit: SubmitHandler<z.output<typeof confiscationSchema>>
    loading: boolean
    register: UseFormRegister<z.input<typeof confiscationSchema>>
    errors: FieldErrors<z.input<typeof confiscationSchema>>
    handleOpenMap: (open: boolean) => void
    control: Control<z.input<typeof confiscationSchema>, unknown, z.output<typeof confiscationSchema>>
}
