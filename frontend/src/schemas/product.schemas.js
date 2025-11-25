// src/schemas/product.schemas.js
import { z } from "zod";

// Schema para crear producto
export const CreateProductSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .trim(),

    id_categoria: z.number({
        required_error: "La categoría es obligatoria",
        invalid_type_error: "Selecciona una categoría válida"
    })
        .int("El ID de categoría debe ser un número entero")
        .positive("Selecciona una categoría válida"),

    precio: z.number({
        required_error: "El precio es obligatorio",
        invalid_type_error: "El precio debe ser un número válido"
    })
        .nonnegative("El precio no puede ser negativo")
        .refine((val) => val >= 0.01, {
            message: "El precio debe ser mayor a $0.00"
        }),

    stock_actual: z.number({
        required_error: "El stock actual es obligatorio",
        invalid_type_error: "El stock debe ser un número válido"
    })
        .int("El stock debe ser un número entero")
        .nonnegative("El stock no puede ser negativo"),

    stock_minimo: z.number({
        required_error: "El stock mínimo es obligatorio",
        invalid_type_error: "El stock mínimo debe ser un número válido"
    })
        .int("El stock mínimo debe ser un número entero")
        .nonnegative("El stock mínimo no puede ser negativo"),
}).refine((data) => data.stock_minimo <= data.stock_actual || data.stock_actual === 0, {
    message: "El stock mínimo no puede ser mayor al stock actual (excepto cuando el stock es 0)",
    path: ["stock_minimo"]
});

// Schema para actualizar producto
export const UpdateProductSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .trim()
        .optional(),

    id_categoria: z.number({
        invalid_type_error: "Selecciona una categoría válida"
    })
        .int("El ID de categoría debe ser un número entero")
        .positive("Selecciona una categoría válida")
        .optional(),

    precio: z.number({
        invalid_type_error: "El precio debe ser un número válido"
    })
        .nonnegative("El precio no puede ser negativo")
        .refine((val) => val === undefined || val >= 0.01, {
            message: "El precio debe ser mayor a $0.00"
        })
        .optional(),

    stock_actual: z.number({
        invalid_type_error: "El stock debe ser un número válido"
    })
        .int("El stock debe ser un número entero")
        .nonnegative("El stock no puede ser negativo")
        .optional(),

    stock_minimo: z.number({
        invalid_type_error: "El stock mínimo debe ser un número válido"
    })
        .int("El stock mínimo debe ser un número entero")
        .nonnegative("El stock mínimo no puede ser negativo")
        .optional(),
}).refine((data) => {
    // Solo validar si ambos campos están presentes
    if (data.stock_minimo !== undefined && data.stock_actual !== undefined) {
        return data.stock_minimo <= data.stock_actual || data.stock_actual === 0;
    }
    return true;
}, {
    message: "El stock mínimo no puede ser mayor al stock actual",
    path: ["stock_minimo"]
});

// Schema para parámetros de ID
export const ProductIdSchema = z.object({
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

// Función helper para extraer todos los errores de Zod
export const getAllValidationErrors = (error) => {
    if (error instanceof z.ZodError) {
        return error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            acc[path] = err.message;
            return acc;
        }, {});
    }
    return {};
};