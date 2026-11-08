import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces"

export interface Permission {
    id?: string,
    identificador?: string,
    nombre: string,
}
export interface PermissionState {
    permissions: Permission[],
    activePermission: Permission,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: ApiErrorMessage
}

export interface PermissionFormModalProps {
    handleOpen: (open: boolean) => void;
    loading: boolean
    activePermission: Permission
    onSaveOrUptdate: (values: Permission) => Promise<void>
    errorMessage: ApiErrorMessage
}
export type PermissionResponse = Omit<Permission, "id" | "identificador"> & { identificador: string };
export type PermissionListResponse = TableOptions & { data: PermissionResponse[] };
