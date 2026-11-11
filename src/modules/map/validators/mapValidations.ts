import { z } from "zod";
import dayjs from "dayjs";

export const mapSchema = z.object({
        typeMap: z.enum(["location", "hot"]),//validador condicional
        start_date: z
                .any()
                .refine((val) => val && dayjs(val).isValid(), "La fecha de inicio es requerida")
                .transform((val) => dayjs(val).format("YYYY-MM-DD")),
        end_date: z
                .any()
                .refine((val) => val && dayjs(val).isValid(), "La fecha final es requerida")
                .transform((val) => dayjs(val).format("YYYY-MM-DD")),
        drugs: z.array(z.number().int().positive()),
        weapons: z.array(z.number().int().positive()).optional(),
        ammunitions: z.array(z.number().int().positive()).optional(),
})
        
