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
    errorMessage: object
}

export interface PermissionFormModalProps {
    handleOpen: Function;
    loading: boolean
    activePermission: Permission
    onSaveOrUptdate: Function
    errorMessage: object | string
}