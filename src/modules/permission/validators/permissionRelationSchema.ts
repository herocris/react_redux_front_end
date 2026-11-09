import type { Permission } from '../types';
import { z } from 'zod';
// IDs or unchanged relation objects observed in JSON contracts. Preserve extra fields.
const relationShape = z.union([
    z.string(), z.number(),
    z.object({ nombre: z.string(), id: z.string().optional(), identificador: z.string().optional() }).passthrough(),
]);
export const permissionRelationSchema = z.custom<string | number | Permission>(value => relationShape.safeParse(value).success, 'Relación no válida');
