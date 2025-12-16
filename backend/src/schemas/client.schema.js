import { z } from 'zod';

export const CreateClientSchema = z.object({
    // Datos principales del cliente
    nombre: z.string()
        .min(3, "El nombre debe tener al menos 3 letras")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras")
        .trim(),

    apellido: z.string()
        .min(3, "El apellido debe tener al menos 3 letras")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras")
        .trim(),

    es_empresa: z.boolean().optional().default(false),

    celular: z.string()
        .regex(/^09\d{8}$/, "El celular debe empezar con 09 y tener 10 dígitos")
        .trim(),

    email: z.string()
        .email("Formato de correo electrónico inválido")
        .toLowerCase()
        .trim(),

    direccion: z.string()
        .min(5, "La dirección debe ser más descriptiva")
        .max(255, "La dirección es muy larga")
        .trim(),

    id_parroquia: z.number({
        invalid_type_error: "La ubicación es inválida",
        required_error: "Selecciona una parroquia"
    }).int().positive(),

    id_estado_cliente: z.number().optional(), // Si no se envía, se asigna uno por defecto

    // Identificaciones (array de objetos)
    identificaciones: z.array(
        z.object({
            id_tipo_identificacion: z.number({
                invalid_type_error: "El tipo de identificación es inválido"
            }).int().positive(),
            identificacion: z.string({
                required_error: "El número de identificación es obligatorio"
            })
                .min(3, "La identificación es muy corta")
                .max(20, "La identificación es muy larga (máx 20 caracteres)")
                .regex(/^[a-zA-Z0-9]+$/, "La identificación no debe contener espacios ni símbolos especiales")
                .trim(),
            es_principal: z.boolean().optional().default(false)
        })
    ).nonempty("Debes ingresar al menos una identificación")
});

export const UpdateClientSchema = CreateClientSchema.partial().extend({
    id_estado_cliente: z.number().optional()
});

export const ClientIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID del cliente debe ser un número válido")
});

export const ChangeStateClientSchema = z.object({
    estado_codigo: z.enum(['CLIENTE_ACTIVO', 'CLIENTE_INACTIVO'], {
        errorMap: () => ({ message: "El estado debe ser 'CLIENTE_ACTIVO' o 'CLIENTE_INACTIVO'." })
    })
});