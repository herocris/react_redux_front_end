import { z } from "zod";
import type { UserPermission, UserRole } from "../types";

export const userSchema = z.object({
    identificador: z.string().optional(),
    correo: z.string().email("El correo no es de formato valido"),
    nombre: z.string().min(1, "El nombre es requerido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    permisos: z.array(z.custom<UserPermission>()).optional(),
    roles: z.array(z.custom<UserRole>()).optional()
});
