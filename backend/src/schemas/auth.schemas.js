// src/schemas/auth.schemas.js
import { z } from 'zod';

// Esquema para login
export const LoginSchema = z.object({
    email: z.string()
        .email("Formato de email inválido")
        .min(1, "El email es requerido")
        .max(100, "El email es demasiado largo"),
    password: z.string()
        .min(1, "La contraseña es requerida")
        .max(100, "La contraseña es demasiado larga")
});

// Esquema para cambio de contraseña (primer ingreso)
export const ChangePasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(128, "La contraseña no puede exceder 128 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (ej: !@#$%^&*)")
        .regex(/^\S*$/, "La contraseña no puede contener espacios en blanco")
        .refine((password) => !/(.)\1{3,}/.test(password), {
            message: "La contraseña contiene caracteres repetidos en exceso"
        })
        .refine((password) => !/^(12345678|password|admin|qwerty|abc123)/i.test(password), {
            message: "La contraseña es demasiado común o predecible"
        })
});

// Esquema para cambio de contraseña con confirmación
export const ChangePasswordWithConfirmationSchema = ChangePasswordSchema.extend({
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

// Esquema para forgot password
export const ForgotPasswordSchema = z.object({
    email: z.string()
        .email("Formato de email inválido")
        .min(1, "El email es requerido")
});

// Esquema para reset password
export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "El token es requerido"),
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(16, "La contraseña no puede exceder 16 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (ej: !@#$%^&*)")
        .regex(/^\S*$/, "La contraseña no puede contener espacios en blanco")
        .refine((password) => !/(.)\1{3,}/.test(password), {
            message: "La contraseña contiene caracteres repetidos en exceso"
        })
        .refine((password) => !/^(12345678|password|admin|qwerty|abc123)/i.test(password), {
            message: "La contraseña es demasiado común o predecible"
        })
});

// Esquema para reset password con confirmación
export const ResetPasswordWithConfirmationSchema = ResetPasswordSchema.extend({
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});