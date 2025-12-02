import { z } from 'zod';

export const CreateIvaSchema = z.object({
    codigo: z.string({
        required_error: "El código del SRI es obligatorio"
    }).min(1, "El código no puede estar vacío").max(10, "El código es muy largo"),

    porcentaje_iva: z.number({
        invalid_type_error: "El porcentaje debe ser un número",
        required_error: "El porcentaje es obligatorio"
    }).int().min(0, "El porcentaje no puede ser negativo").max(100, "El porcentaje no puede superar 100"),

    descripcion: z.string({
        required_error: "La descripción es obligatoria"
    }).min(3, "La descripción es muy corta")
});

export const UpdateIvaSchema = CreateIvaSchema.partial();

export const IvaIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "ID inválido")
});