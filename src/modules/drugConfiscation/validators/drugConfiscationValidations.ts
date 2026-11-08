import { z } from "zod";
import { imageSchema } from "../../../shared/validators/imageValidation";

export const drugConfiscationSchema = z.object({
    identificador: z.string().optional(),
    cantidad: z.coerce.number().min(1, "Debe haber al menos uno"),
    peso: z.coerce.number().min(0.01, "Debe haber al menos 0.01"),
    decomiso: z.number().positive("Debe haber un decomiso"),
    droga: z.coerce.number().positive("Debe haber una droga"),
    presentacion: z.coerce.number().positive("Debe haber una presentación"),
    foto: imageSchema,
});

// import { z } from "zod";

// export const ammunitionSchema = z.object({
//     identificador: z.string().optional(),
//     descripcion: z.string().min(1, "La descripción es requerida"),

//     logo: z
//         .array(
//             z.union([
//                 z
//                     .instanceof(File)
//                     .refine(file => file.size <= 5_000_000, { message: "Cada archivo debe pesar menos de 5 MB" }),
//                 z.string().min(1, "La imagen existente es requerida"),
//             ])
//         )
//         .min(1, "Debes subir al menos una imagen")
//         .refine(arr => arr.length > 0, { message: "Debes subir al menos una imagen" }),
// });

