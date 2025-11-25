// src/schemas/config.schemas.js
import { z } from 'zod';

// Schema para tiempo de expiración de token
export const TokenExpirationSchema = z.object({
    tiempo_expiracion: z.string()
        .min(1, "El tiempo de expiración es requerido")
        .regex(/^\d+[smhd]$/, {
            message: 'Formato inválido. Use "s" (segundos), "m" (minutos), "h" (horas) o "d" (días). Ej: "8h"'
        })
        .refine((time) => {
            // Validación adicional: máximo 30 días por seguridad
            const value = parseInt(time);
            const unit = time.slice(-1);

            if (unit === 'd' && value > 30) {
                return false;
            }
            if (unit === 'h' && value > 720) { // 30 días en horas
                return false;
            }
            return true;
        }, {
            message: 'El tiempo máximo permitido es 30 días'
        })
});

// Schema para configuración de bloqueo
export const BlockConfigSchema = z.object({
    intentos_maximos: z.number()
        .int("Los intentos máximos deben ser un número entero")
        .min(1, "Mínimo 1 intento permitido")
        .max(10, "Máximo 10 intentos permitidos por seguridad"),

    duracion_bloqueo_minutos: z.number()
        .int("La duración debe ser un número entero")
        .min(1, "Mínimo 1 minuto de bloqueo")
        .max(1440, "Máximo 24 horas (1440 minutos) de bloqueo")
});

// Schema para parámetros de configuración (si necesitas)
export const ConfigIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número")
        .transform(Number)
});