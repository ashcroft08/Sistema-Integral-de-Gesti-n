// src/middleware/validation.middleware.js
import { z } from 'zod';

/**
 * Middleware factory para validar request bodies con Zod
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Validar con Zod 4.0
            const result = schema.safeParse(req.body);

            if (!result.success) {
                // Formatear errores de Zod 4.0
                const formattedErrors = result.error.issues.map(issue => ({
                    field: issue.path[0] || 'general',
                    message: issue.message,
                    code: issue.code
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: formattedErrors
                });
            }

            // Datos validados - Zod 4.0 infiere el tipo automáticamente
            req.validatedData = result.data;
            next();

        } catch (error) {
            console.error('Error en validación:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno en validación'
            });
        }
    };
};

/**
 * Middleware para validar parámetros de URL
 */
export const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Parámetros inválidos',
                    details: result.error.issues
                });
            }

            req.validatedParams = result.data;
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error en validación de parámetros'
            });
        }
    };
};