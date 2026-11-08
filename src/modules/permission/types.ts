import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface PermissionFormValues {
    identificador?: string,
    nombre: string,
}

// Contrato heredado para selección, formularios y consumidores de resouce.
export interface Permission extends PermissionFormValues {
    id?: string,
}

export interface PermissionEntity {
    id: string,
    nombre: string,
}

export interface PermissionListParams {
    page: number,
    sortBy: string,
    orderType: string,
    per_page: number,
    search_by: string,
    valueSearch: string,
}

export interface PermissionListResult {
    permissions: PermissionEntity[],
    tableOptions: TableOptions,
}
export interface PermissionFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activePermission: Permission
    onSaveOrUptdate: (values: Permission) => Promise<void>
    errorMessage: ApiErrorMessage
}
export interface PermissionResponse {
    identificador: string,
    nombre: string,
}
export type PermissionListResponse = TableOptions & { data: PermissionResponse[] };
