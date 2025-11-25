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
        .min(1, "El email es requerido")
        .max(100, "El email es demasiado largo"),
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
        .min(1, "La confirmación de contraseña es requerida")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["confirmNewPassword"],
});

// Schema combinado para el formulario de configuración
// Los campos de contraseña son opcionales (solo se validan si se llenan)
export const UserSettingsSchema = z.object({
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

    // Campos de contraseña opcionales - pueden ser string vacío o undefined
    currentPassword: z.string().default(''),
    newPassword: z.string().default(''),
    confirmNewPassword: z.string().default('')
}).refine((data) => {
    // Si se llena newPassword, currentPassword es requerido
    if (data.newPassword && data.newPassword.trim() !== '') {
        return data.currentPassword && data.currentPassword.trim() !== '';
    }
    return true;
}, {
    message: "La contraseña actual es requerida para cambiar la contraseña",
    path: ["currentPassword"],
}).refine((data) => {
    // Si se llena newPassword, debe cumplir con los requisitos
    if (data.newPassword && data.newPassword.trim() !== '') {
        const password = data.newPassword;
        if (password.length < 8 || password.length > 16) {
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            return false;
        }
        if (!/[a-z]/.test(password)) {
            return false;
        }
        if (!/[0-9]/.test(password)) {
            return false;
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return false;
        }
    }
    return true;
}, {
    message: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
    path: ["newPassword"],
}).refine((data) => {
    // Si se llena newPassword, confirmNewPassword debe coincidir
    if (data.newPassword && data.newPassword.trim() !== '') {
        return data.newPassword === data.confirmNewPassword;
    }
    return true;
}, {
    message: "Las nuevas contraseñas no coinciden",
    path: ["confirmNewPassword"],
});

