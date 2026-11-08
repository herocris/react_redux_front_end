import type { PermissionOptionsStatusProps } from '../permission/components/PermissionOptionsStatus';
import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces";
import { Permission } from "../permission";
import { Role } from "../rol";

export interface User {
    id?: string,
    identificador?: string,
    correo: string,
    nombre: string,
    password?: string,
    permisos?: UserPermission[],
    roles?: UserRole[]
}

export interface UserFormModalProps {
    permissionOptionsStatus: PermissionOptionsStatusProps;
    handleOpen: (open: boolean) => void;
    permisos: { value: string | number; description: string }[]
    roles: { value: string | number; description: string }[]
    loading: boolean
    activeUser: User
    onSaveOrUptdate: (values: User) => Promise<void>
    errorMessage: ApiErrorMessage
}

export interface UserState {
    users: User[],
    activeUser: User,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: ApiErrorMessage
}

// Select identifiers and unchanged relation objects returned by the server.
export type UserPermission = string | number | Permission;
export type UserRole = string | number | Role;
export type UserResponse = Omit<User, 'id' | 'identificador'> & { identificador: string };
export type UserListResponse = TableOptions & { data: UserResponse[] };
