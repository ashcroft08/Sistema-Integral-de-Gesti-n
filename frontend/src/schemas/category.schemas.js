import { z } from "zod";

// Schema para crear categoría
export const CreateCategorySchema = z.object({
    categoria: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
});

// Schema para actualizar categoría
export const UpdateCategorySchema = z.object({
    categoria: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
});

// Schema para cambiar estado
export const ChangeCategoryStatusSchema = z.object({
    id_estado_categoria: z.number()
        .int("El ID de estado debe ser un número entero")
        .min(1, "El ID de estado es requerido")
        .max(2, "El ID de estado debe ser 1 (Activo) o 2 (Inactivo)")
});

// Schema para ID de categoría
export const CategoryIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número")
        .transform(Number)
});

// Función helper para manejar errores de validación
export const getValidationError = (error) => {
    if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Error de validación";
    }
    return error.message || "Error desconocido";
};