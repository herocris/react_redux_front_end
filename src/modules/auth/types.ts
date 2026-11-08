import type { ReactNode } from "react"

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

export interface PasswordFieldProps {
    name:string
    errorMessage: string|undefined
    hasError:boolean
    register:Function
}

export interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
}

export type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

// Session contracts are independent of the administrative user and its form.
export type SessionPermission = string | number | {
    id?: string;
    identificador?: string;
    nombre: string;
};
export type SessionRole = string | number | {
    id?: string;
    identificador?: string;
    nombre: string;
    permisos?: SessionPermission[];
};
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
}
