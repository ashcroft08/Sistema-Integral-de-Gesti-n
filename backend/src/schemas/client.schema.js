import { z } from 'zod';

export const CreateClientSchema = z.object({
    // Validamos que sean números enteros positivos
    id_tipo_identificacion: z.number({
        invalid_type_error: "El tipo de identificación es inválido",
        required_error: "Selecciona un tipo de identificación"
    }).int().positive(),

    id_parroquia: z.number({
        invalid_type_error: "La ubicación es inválida",
        required_error: "Selecciona una parroquia"
    }).int().positive(),

    // Validamos formato general (letras y números, longitud razonable)
    // La validación matemática estricta se hará en el Service
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

    // Validación estricta de celular Ecuador (09xxxxxxxx)
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

// Para actualizar, permitimos enviar solo los campos que cambiaron (.partial())
export const UpdateClientSchema = CreateClientSchema.partial();

// Validación para parámetros de URL (ej: /api/clients/:id)
export const ClientIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID del cliente debe ser un número válido")
});