// src/schemas/user.schemas.js
import { z } from 'zod';

// Schema para crear usuario
export const CreateUserSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),

    apellido: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres"),

    email: z.string()
        .email("Formato de email inválido")
        .max(100, "El email es demasiado largo"),

    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(16, "La contraseña no puede exceder 16 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

    id_rol: z.number()
        .int("El ID de rol debe ser un número entero")
        .min(1, "El ID de rol es requerido"),

    id_estado_usuario: z.number()
        .int("El ID de estado debe ser un número entero")
        .optional()
});

export const UpdateUserSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .optional(),
    apellido: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .optional(),
    email: z.string()
        .email("Formato de email inválido")
        .max(100, "El email es demasiado largo")
        .optional(),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(16, "La contraseña no puede exceder 16 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
        .optional(),
    id_rol: z.number()
        .int("El ID de rol debe ser un número entero")
        .min(1, "El ID de rol es requerido")
        .optional(),
    id_estado_usuario: z.number()
        .int("El ID de estado debe ser un número entero")
        .optional(),
    // Campo adicional para el controlador/servicio
    sendPasswordEmail: z.boolean().optional() // Campo opcional para indicar si enviar correo con la nueva contraseña
});

// Schema para parámetros de ID
export const UserIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número")
        .transform(Number)
});

// Schema para cambiar estado de usuario
export const ChangeUserStatusSchema = z.object({
    id_estado_usuario: z.number()
        .int("El ID de estado debe ser un número entero")
        .min(1, "El ID de estado es requerido")
});