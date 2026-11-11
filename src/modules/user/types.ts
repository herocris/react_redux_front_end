import type { PermissionOptionsStatusProps } from '../permission/components/PermissionOptionsStatus';
import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces";

export interface User {
    id?: number,
    identificador?: number,
    correo: string,
    nombre: string,
    password?: string,
    permisos?: UserPermission[],
    roles?: UserRole[]
}

export interface UserFormModalProps {
    roleOptionsStatus: PermissionOptionsStatusProps;
    permissionOptionsStatus: PermissionOptionsStatusProps;
    handleOpen: (open: boolean) => void;
    permisos: { value: number; description: string }[]
    roles: { value: number; description: string }[]
    loading: boolean
    activeUser: User
    onSaveOrUptdate: (values: User) => Promise<void>
    errorMessage: ApiErrorMessage
}


// Public aliases retained; administrative relations are numeric IDs.
export type UserPermission = number;
export type UserRole = number;
export type UserResponse = Omit<User, 'id' | 'identificador'> & { identificador: number };
export type UserListResponse = TableOptions & { data: UserResponse[] };

export type UserEntity = Omit<UserResponse, 'identificador'> & { id: number };
