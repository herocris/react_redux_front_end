import { z } from "zod";
import dayjs from "dayjs";

export const graphSchema = z.object({
        period: z.number().min(1, "El periodo es requerido"),
        typeConfiscation: z.enum(["Drogas", "Armas", "Municiones"]),//validador condicional
        typeGraph: z.enum(["bar", "line", "pie"]),//validador condicional
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
})//validacion condicional en base a type
        .superRefine((data, ctx) => {
                // Según el tipo seleccionado, validar el array correspondiente
                if (data.typeConfiscation === "Drogas" && (!data.drugs || data.drugs.length === 0)) {
                        //console.log('esta validando');
                        
                        ctx.addIssue({
                                path: ["drugs"],
                                message: "Debe seleccionar al menos una droga",
                                code: z.ZodIssueCode.custom,
                        });
                }
                if (data.typeConfiscation === "Armas" && (!data.weapons || data.weapons.length === 0)) {
                        ctx.addIssue({
                                path: ["weapons"],
                                message: "Debe seleccionar al menos un arma",
                                code: z.ZodIssueCode.custom,
                        });
                }
                if (data.typeConfiscation === "Municiones" && (!data.ammunitions || data.ammunitions.length === 0)) {
                        ctx.addIssue({
                                path: ["ammunitions"],
                                message: "Debe seleccionar al menos una munición",
                                code: z.ZodIssueCode.custom,
                        });
                }
        });
