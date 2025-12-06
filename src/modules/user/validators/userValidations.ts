import { z } from "zod";

// const passwordSchema = z
//     .string()
//     .min(8, "La contraseña debe tener al menos 8 caracteres")
//     .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
//     .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
//     .regex(/[0-9]/, "Debe incluir al menos un número")
//     .regex(/[@$!%*?&_]/, "Debe incluir al menos un carácter especial (@, $, !, %, *, ?, &, _)");

export const userSchema = z.object({
    identificador: z.string().optional(),
    correo: z.string().email("El correo no es de formato valido"),
    nombre: z.string().min(1, "El nombre es requerido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    permisos: z.array(z.any()).optional(),
    roles: z.array(z.any()).optional()
});
