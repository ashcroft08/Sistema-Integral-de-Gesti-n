// src/schemas/config.schemas.js
import { z } from 'zod';

// Schema para tiempo de expiración de token (frontend)
export const TokenExpirationFrontendSchema = z.object({
    expirationValue: z.string()
        .min(1, "El valor es requerido")
        .regex(/^\d+$/, "Debe ser un número válido"),
    expirationUnit: z.enum(["Minutos", "Horas", "Días"], {
        errorMap: () => ({ message: "Selecciona una unidad válida" })
    })
});

// Schema para configuración de bloqueo (frontend)
export const BlockConfigFrontendSchema = z.object({
    intentos_maximos: z.number()
        .int("Los intentos máximos deben ser un número entero")
        .min(1, "Mínimo 1 intento permitido")
        .max(10, "Máximo 10 intentos permitidos por seguridad"),
    duracion_bloqueo_minutos: z.number()
        .int("La duración debe ser un número entero")
        .min(1, "Mínimo 1 minuto de bloqueo")
        .max(1440, "Máximo 24 horas (1440 minutos) de bloqueo")
});