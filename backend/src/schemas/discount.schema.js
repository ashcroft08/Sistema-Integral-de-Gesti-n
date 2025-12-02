import { z } from 'zod';

export const CreateDiscountSchema = z.object({
    descuento: z.string({
        required_error: "El nombre del descuento es obligatorio"
    }).min(3, "El nombre es muy corto (ej: 'Mayorista')").max(100),

    porcentaje_descuento: z.number({
        invalid_type_error: "El porcentaje debe ser un número",
        required_error: "El porcentaje es obligatorio"
    }).min(0, "El porcentaje no puede ser negativo").max(100, "El porcentaje no puede superar el 100%"),

    codigo: z.string({
        required_error: "El código es obligatorio"
    }).min(3, "El código es muy corto").max(20).regex(/^[A-Z0-9_]+$/, "El código solo debe tener mayúsculas, números y guiones bajos (ej: DESC_VIP)"),

    activo: z.boolean().optional().default(true)
});

export const UpdateDiscountSchema = CreateDiscountSchema.partial();

export const DiscountIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID inválido")
});