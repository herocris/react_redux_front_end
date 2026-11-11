import type { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Activity {
    id: number,
    tipo_de_evento: string,
    descripcion?: string,
    id_usuario: number | null,
    usuario: string,
    cambios: string | undefined,
    fecha: string
}

// The API supplies changes before JSON serialization and dates before display formatting.
export type ActivityResponse = Omit<Activity, 'id' | 'cambios'> & {
    identificador: number;
    cambios: unknown;
};
export type ActivityListResponse = TableOptions & { data: ActivityResponse[] };
