import { z } from "zod";
import dayjs from "dayjs";

export const confiscationSchema = z.object({
    identificador: z.number().int().positive().optional(),
    fecha: z
        .any()
        .refine((val) => val && dayjs(val).isValid(), "La fecha es requerida")
        .transform((val) => dayjs(val).format("YYYY-MM-DD")),
    observacion: z.string().min(1, "La observation es requerido"),
    direccion: z.string().min(1, "La direction es requerido"),
    departamento: z.string().min(1, "La department es requerido"),
    municipalidad: z.string().min(1, "La municipality es requerido"),
    latitud: z.number(),
    longitud: z.number(),

});

