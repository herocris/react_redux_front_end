import { z } from "zod";

import type { RolePermission } from '../types';

export const roleSchema = z.object({
    identificador: z.string().optional(),
    nombre: z.string().min(1, "El nombre es requerido"),
    // Preserve the existing permissive validation without transforming relation values.
    permisos: z.array(z.custom<RolePermission>()).optional(),
});
