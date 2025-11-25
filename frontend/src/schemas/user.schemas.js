// src/schemas/user.schemas.js
import { z } from 'zod';

// Schema para crear usuario
export const CreateUserSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),

    apellido: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras y espacios"),

    email: z.string()
        .email("Formato de email inválido")
        .min(1, "El email es requerido")
        .max(100, "El email es demasiado largo"),

    password: z.string()
        .min(1, "La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(16, "La contraseña no puede exceder 16 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

    confirmarContrasena: z.string()
        .min(1, "La confirmación de contraseña es requerida"),

    // Simplificamos la validación de ID Rol
    id_rol: z.coerce.number() // "coerce" convierte string "2" a number 2 automáticamente
        .int()
        .positive("Selecciona un rol válido"),

    id_estado_usuario: z.number()
        .int("El ID de estado debe ser un número entero")
        .optional()
}).refine((data) => data.password === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
});

// Schema para actualizar usuario
export const UpdateUserSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios")
        .optional(),

    apellido: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El apellido solo puede contener letras y espacios")
        .optional(),

    email: z.string()
        .email("Formato de email inválido")
        .min(1, "El email es requerido")
        .max(100, "El email es demasiado largo")
        .optional(),

    password: z.string()
        .optional()
        .transform(val => val === '' ? undefined : val) // Convertir string vacío a undefined
        .pipe(z.string().min(8).optional()), // Validar longitud solo si existe

    confirmarContrasena: z.string()
        .optional()
        .or(z.literal('')),

    // Simplificamos la validación de ID Rol
    id_rol: z.coerce.number() // "coerce" convierte string "2" a number 2 automáticamente
        .int()
        .positive("Selecciona un rol válido"),
}).refine((data) => {
    // Solo validar coincidencia si se proporciona contraseña
    if (data.password && data.password !== '') {
        return data.password === data.confirmarContrasena;
    }
    return true;
}, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
});

// Schema para parámetros de ID
export const UserIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número")
        .transform(Number)
});

// Schema para cambiar estado de usuario
export const ChangeUserStatusSchema = z.object({
    estado: z.enum(['Activo', 'Inactivo', 'Bloqueado'])
});

// Schema para resetear contraseña
export const ResetPasswordSchema = z.object({
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(16, "La contraseña no puede exceder 16 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

    confirmarContrasena: z.string()
}).refine((data) => data.password === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
});

// Función de validación genérica
export const validateFormData = (schema, data) => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = {};
            error.errors.forEach((err) => {
                errors[err.path[0]] = err.message;
            });
            return { success: false, data: null, errors };
        }
        return { success: false, data: null, errors: { general: error.message } };
    }
};