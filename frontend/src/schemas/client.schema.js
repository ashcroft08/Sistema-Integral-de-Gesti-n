// schemas/client.schema.js
import { z } from 'zod';

// Transform helper: convierte string vacío o string numérico a número, y maneja valores vacíos
const stringToNumber = z.union([
    z.number().int().positive(),
    z.string()
        .transform((val) => {
            // Si es una cadena vacía, devolvemos undefined
            if (val === "") {
                return undefined;
            }
            // Si no es vacía, intentamos convertirla a número
            const num = Number(val);
            if (isNaN(num) || num <= 0) {
                throw new Error("Debe ser un número válido mayor a 0");
            }
            return num;
        })
]);

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

    id_parroquia: stringToNumber,

    // ✅ NUEVO: Array de identificaciones
    identificaciones: z.array(
        z.object({
            id_tipo_identificacion: z.union([
                z.number().int().positive(),
                z.string().regex(/^\d+$/).transform(Number)
            ]),
            identificacion: z.string()
                .min(3, "La identificación es muy corta")
                .max(20, "La identificación es muy larga")
                .regex(/^[a-zA-Z0-9]+$/, "Solo letras y números, sin espacios")
                .trim(),
            es_principal: z.boolean().optional().default(false)
        })
    ).nonempty("Debes ingresar al menos una identificación")
});

export const UpdateClientSchema = CreateClientSchema;

export const ClientIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID del cliente debe ser un número válido")
});

export const ChangeStateClientSchema = z.object({
    estado_codigo: z.enum(['CLIENTE_ACTIVO', 'CLIENTE_INACTIVO'], {
        errorMap: () => ({ message: "El estado debe ser 'CLIENTE_ACTIVO' o 'CLIENTE_INACTIVO'." })
    })
});