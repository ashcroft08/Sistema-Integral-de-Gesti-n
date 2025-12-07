import { z } from "zod";

export const CreateProductSchema = z.object({
    id_categoria: z.number({
        required_error: "La categoría es obligatoria",
        invalid_type_error: "El ID de categoría debe ser un número"
    })
        .int()
        .positive("El ID de categoría debe ser positivo"),

    nombre: z.string({ required_error: "El nombre es obligatorio" })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),

    // ✅ OBLIGATORIO: Código de producto
    codigo_producto: z.string({ required_error: "El código de barras es obligatorio" })
        .trim()
        .min(3, "El código debe tener al menos 3 caracteres")
        .max(50, "El código no puede exceder 50 caracteres"),


    precio: z.number({ required_error: "El precio es obligatorio" })
        .nonnegative("El precio no puede ser negativo"),

    stock_actual: z.number({ required_error: "El stock es obligatorio" })
        .int("El stock debe ser un número entero")
        .min(0, "El stock no puede ser negativo"),

    stock_minimo: z.number({ required_error: "El stock mínimo es obligatorio" })
        .int("El stock mínimo debe ser un número entero")
        .min(0, "El stock mínimo no puede ser negativo"),
});

export const UpdateProductSchema = z.object({
    id_categoria: z.number()
        .int()
        .positive()
        .optional(),

    nombre: z.string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .optional(),

    // ✅ OPCIONAL en actualización (permite cambiar o mantener)
    codigo_producto: z.string()
        .trim()
        .min(3, "El código debe tener al menos 3 caracteres")
        .max(50, "El código no puede exceder 50 caracteres")

        .optional(),

    precio: z.number()
        .nonnegative("El precio no puede ser negativo")
        .optional(),

    stock_actual: z.number()
        .int()
        .min(0, "El stock no puede ser negativo")
        .optional(),

    stock_minimo: z.number()
        .int()
        .min(0, "El stock mínimo no puede ser negativo")
        .optional(),
});

export const ChangeProductStatusSchema = z.object({
    id_estado_producto: z.number({
        required_error: "El ID de estado es requerido",
        invalid_type_error: "El ID de estado debe ser un número"
    })
        .int()
        .positive("El ID de estado debe ser un número positivo")
});

export const ProductIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número válido")
        .transform(Number)
});