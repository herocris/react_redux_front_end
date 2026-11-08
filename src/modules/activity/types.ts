import type { TableOptions } from "../../shared/interfaces/sharedInterfaces"
import type { ApiErrorMessage } from '../../api/apiErrors';

export interface Activity {
    id: string,
    tipo_de_evento: string,
    descripcion?: string,
    id_usuario: number,
    usuario: string,
    cambios: string | undefined,
    fecha: string
}
export interface ActivityState {
    activities: Activity[],
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: ApiErrorMessage
}

// The API supplies changes before JSON serialization and dates before display formatting.
export type ActivityResponse = Omit<Activity, 'id' | 'cambios'> & {
    identificador: string;
    cambios: unknown;
};
export type ActivityListResponse = TableOptions & { data: ActivityResponse[] };
