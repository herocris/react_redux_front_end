import type { PermissionOptionsStatusProps } from '../permission/components/PermissionOptionsStatus';
import type { ApiErrorMessage } from '../../api/apiErrors';
import { TableOptions } from "../../shared/interfaces/sharedInterfaces";

// Administrative relations and select values are numeric backend IDs.
export type RolePermission = number;

export interface Role {
    id?: number,
    identificador?: number,
    nombre: string,
    permisos?: RolePermission[]
}
export interface RoleFormModalProps {
    permissionOptionsStatus: PermissionOptionsStatusProps;
    handleOpen: (open: boolean) => void;
    permisos: { value: number; description: string }[]
    loading: boolean
    activeRole: Role
    onSaveOrUptdate: (values: Role) => Promise<void>
    errorMessage: ApiErrorMessage
}

export type RoleResponse = Omit<Role, "id" | "identificador"> & { identificador: number };
export type RoleListResponse = TableOptions & { data: RoleResponse[] };

export type RoleEntity = Omit<RoleResponse, 'identificador'> & { id: number };
