import { SelectOptions, TableOptions } from "../../shared/interfaces/sharedInterfaces";
import { Permission } from "../permission";

export interface Role {
    id?: string,
    identificador?: string,
    nombre: string,
    permisos?: Permission[]
}
export interface RoleState {
    roles: Role[],
    activeRole: Role,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}
export interface RoleFormModalProps {
    handleOpen: Function;
    permisos: SelectOptions[]
    loading: boolean
    activeRole: Role
    onSaveOrUptdate: Function
    errorMessage: object | string
}
