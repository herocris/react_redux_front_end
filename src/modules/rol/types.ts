import type { PermissionOptionsStatusProps } from '../permission/components/PermissionOptionsStatus';
import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces";
import type { Permission } from "../permission";

// Identifier values emitted by the select, or unchanged legacy relation objects.
export type RolePermission = string | number | Permission;

export interface Role {
    id?: string,
    identificador?: string,
    nombre: string,
    permisos?: RolePermission[]
}
export interface RoleState {
    roles: Role[],
    activeRole: Role,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: ApiErrorMessage
}
export interface RoleFormModalProps {
    permissionOptionsStatus: PermissionOptionsStatusProps;
    handleOpen: (open: boolean) => void;
    permisos: { value: string | number; description: string }[]
    loading: boolean
    activeRole: Role
    onSaveOrUptdate: (values: Role) => Promise<void>
    errorMessage: ApiErrorMessage
}

export type RoleResponse = Omit<Role, "id" | "identificador"> & { identificador: string };
export type RoleListResponse = TableOptions & { data: RoleResponse[] };
