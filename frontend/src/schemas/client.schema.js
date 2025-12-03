// schemas/client.schema.js - CORREGIDO DEFINITIVO
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
    id_tipo_identificacion: stringToNumber,
    id_parroquia: stringToNumber, // ⚠️ Ahora aceptará "" y lo convertirá en undefined
    identificacion: z.string({
        required_error: "El número de identificación es obligatorio"
    })
        .min(3, "La identificación es muy corta")
        .max(20, "La identificación es muy larga (máx 20 caracteres)")
        .regex(/^[a-zA-Z0-9]+$/, "La identificación no debe contener espacios ni símbolos especiales")
        .trim(),
    nombre: z.string()
        .min(3, "El nombre debe tener al menos 3 letras")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras")
        .trim(),
    apellido: z.string()
        .min(3, "El apellido debe tener al menos 3 letras")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras")
        .trim(),
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
        .trim()
});

// Schema para actualización (todos los campos opcionales)
export const UpdateClientSchema = z.object({
    id_tipo_identificacion: z.union([
        z.number().int().positive(),
        z.string().transform((val) => val === "" ? undefined : Number(val))
    ]).optional(),
    id_parroquia: z.union([
        z.number().int().positive(),
        z.string().transform((val) => val === "" ? undefined : Number(val))
    ]).optional(),
    identificacion: z.string()
        .min(3, "La identificación es muy corta")
        .max(20, "La identificación es muy larga")
        .regex(/^[a-zA-Z0-9]+$/, "La identificación no debe contener espacios ni símbolos")
        .trim()
        .optional(),
    nombre: z.string()
        .min(3, "El nombre debe tener al menos 3 letras")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras")
        .trim()
        .optional(),
    apellido: z.string()
        .min(3, "El apellido debe tener al menos 3 letras")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras")
        .trim()
        .optional(),
    celular: z.string()
        .regex(/^09\d{8}$/, "El celular debe empezar con 09 y tener 10 dígitos")
        .trim()
        .optional(),
    email: z.string()
        .email("Formato de correo electrónico inválido")
        .toLowerCase()
        .trim()
        .optional(),
    direccion: z.string()
        .min(5, "La dirección debe ser más descriptiva")
        .max(255, "La dirección es muy larga")
        .trim()
        .optional()
});