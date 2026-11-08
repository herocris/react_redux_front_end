import { z } from "zod";

// Existing image references are preserved; only new files have byte limits.
export const imageSchema = z.union([
    z.instanceof(File, { message: "El logo es requerido" })
        .refine(file => file.size > 0, { message: "El archivo no puede estar vacío" })
        .refine(file => file.size <= 5_000_000, { message: "Max size exceeded" }),
    z.string().min(1, "El logo es requerido como texto"),
]);
