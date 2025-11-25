// src/schemas/userSettings.schemas.js
import { z } from 'zod';

// Schema para actualizar perfil
export const UpdateProfileSchema = z.object({
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
        .max(100, "El email es demasiado largo")
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de email inválido"),
});

// Schema para cambiar contraseña
export const ChangePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "La contraseña actual es requerida"),

    newPassword: z.string()
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .max(16, "La nueva contraseña no puede exceder 16 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),

    confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["confirmNewPassword"],
});

// Schema combinado para configuración completa
export const UserSettingsSchema = z.object({
    profile: UpdateProfileSchema.optional(),
    password: ChangePasswordSchema.optional()
}).refine((data) => data.profile || data.password, {
    message: "Debe proporcionar datos para actualizar el perfil o la contraseña",
});