import type { Role } from '../types';
import { z } from 'zod';
import { permissionRelationSchema } from '../../permission/validators/permissionRelationSchema';
const relationShape = z.union([
    z.string(), z.number(),
    z.object({ nombre: z.string(), id: z.string().optional(), identificador: z.string().optional(),
        permisos: z.array(permissionRelationSchema).optional() }).passthrough(),
]);
export const roleRelationSchema = z.custom<string | number | Role>(value => relationShape.safeParse(value).success, 'Relación no válida');

export const roleSchema = z.object({
    identificador: z.string().optional(), nombre: z.string().min(1, 'El nombre es requerido'),
    permisos: z.array(permissionRelationSchema).optional(),
});
