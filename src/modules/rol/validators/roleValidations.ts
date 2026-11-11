import { z } from 'zod';
import { permissionRelationSchema } from '../../permission/validators/permissionRelationSchema';
export const roleRelationSchema = z.number().int().positive();

export const roleSchema = z.object({
    identificador: z.number().int().positive().optional(), nombre: z.string().min(1, 'El nombre es requerido'),
    permisos: z.array(permissionRelationSchema).optional(),
});
