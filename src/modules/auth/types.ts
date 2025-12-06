import { ReactNode } from "react"
import { User } from "../user"

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

export interface AuthState {
    status: string,
    user: User,
    errorMessage: {} | undefined
}


export interface AuthError {
    error: string,
}