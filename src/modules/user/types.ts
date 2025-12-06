import { SelectOptions, TableOptions } from "../../shared/interfaces/sharedInterfaces";
import { Permission } from "../permission";
import { Role } from "../rol";

export interface User {
    id?: string,
    identificador?: string,
    correo: string,
    nombre: string,
    password?: string,
    permisos?: Permission[],
    roles?: Role[]
}

export interface UserFormModalProps {
    handleOpen: Function;
    permisos: SelectOptions[]
    roles: SelectOptions[]
    loading: boolean
    activeUser: User
    onSaveOrUptdate: Function
    errorMessage: object | string
}

export interface UserState {
    users: User[],
    activeUser: User,
    tableOptions: TableOptions,
    loading: boolean
    errorMessage: object
}

export interface userUseForm {
    user: User,
    formValidations: UserValidationsRule,
}

export interface UserValidationsRule {
    correo: Array<string | Function>,
    nombre: Array<string | Function>,
    password: Array<string | Function>,
}