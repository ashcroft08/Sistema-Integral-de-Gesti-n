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
        .max(16, "La contraseña es demasiado larga")
});

// Esquema para cambio de contraseña (primer ingreso)
export const ChangePasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
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
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
});

// ✅ ESQUEMA CON CONFIRMACIÓN DE CONTRASEÑA PARA CAMBIAR LA CONTRASEÑA (OLVIDAR CONTRASEÑA)
export const ResetPasswordWithConfirmationSchema = z.object({
    token: z.string().min(1, "El token es requerido"),
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

// ✅ Schema para cambio de contraseña con confirmación
export const ChangePasswordWithConfirmationSchema = z.object({
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});