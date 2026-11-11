import { z } from 'zod';

export const identifierSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);

// HTTP responses and internal keys must already contain numbers. No coercion here.
export const readId = (value: unknown): number => identifierSchema.parse(value);

// Router params are the only text-to-ID boundary. Reject partial/empty/unsafe IDs.
export const parseRouteId = (value: string | undefined): number => {
    if (value === undefined || !/^\d+$/.test(value)) throw new Error('Identificador de ruta no válido.');
    return readId(Number(value));
};
