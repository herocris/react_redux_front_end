import { z } from 'zod';
// Administrative relations contain numeric IDs; session names are separate.
export const permissionRelationSchema = z.number().int().positive();
