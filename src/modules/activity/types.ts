import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Activity {
    identificador?: string,
    tipo_de_evento: string,
    id_usuario: number,
    usuario: string,
    cambios: string,
    fecha: string
}
export interface ActivityState {
    activities: Activity[],
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}
