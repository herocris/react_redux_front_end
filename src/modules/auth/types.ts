import type { ReactNode } from "react"
import type { FieldPath, FieldValues, UseFormRegister } from 'react-hook-form';

export interface LoginData {
    email:string
    password:string
}
export interface RegisterData {
    name:string
    email:string
    password:string
    passwordConfirmation:string
}

export interface PasswordFieldProps<T extends FieldValues> {
    name: FieldPath<T>
    errorMessage: string|undefined
    hasError:boolean
    register: UseFormRegister<T>
}

export interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
}

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

// Session contracts are independent of the administrative user and its form.
export type SessionPermission = string;
export type SessionRole = string;
export interface SessionUser {
    nombre: string;
    correo: string;
    roles?: SessionRole[];
    permisos?: SessionPermission[];
}

export interface SessionResponse {
    user: { name: string; email: string };
    roles: SessionRole[];
    permissions: SessionPermission[];
}
// Registration previously consumed data.user directly; retain that shape too.
export type RegisterResponse = { user: SessionUser } | SessionResponse;

export type AuthError = string;
export interface AuthState {
    status: AuthStatus;
    user: SessionUser;
    errorMessage: AuthError | undefined;
    authorizationRevision: number;
    authorizationError: string | null;
}
