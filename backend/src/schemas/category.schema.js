import { z } from "zod";

// Schema para crear categoria
export const CreateCategorySchema = z.object({
    categoria: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),

    id_estado_categoria: z.number()
        .int("El ID de estado debe ser un número entero")
        .optional()
})

// Schema para actualizar categoria
export const UpdateCategorySchema = z.object({
    categoria: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
})

// Schema para parámetros de ID
export const CategoryIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número")
        .transform(Number)
});

// Schema para cambiar estado de usuario
export const ChangeCategoryStatusSchema = z.object({
    id_estado_categoria: z.number()
        .int("El ID de estado debe ser un número entero")
        .min(1, "El ID de estado es requerido")
});