// ============================================
// src/middleware/validation.middleware.js
// MEJORADO - Compatible con Zod 3.x y 4.x
// ============================================
import { z } from 'zod';

/**
 * Middleware factory para validar request bodies/params/query con Zod
 * @param {z.ZodSchema} schema - Schema de Zod para validar
 * @param {string} source - Dónde validar: 'body', 'params', 'query'
 */
export const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            // Obtener datos según el source
            const dataToValidate = req[source];

            // Validar con Zod (compatible 3.x y 4.x)
            const result = schema.safeParse(dataToValidate);

            if (!result.success) {
                // Formatear errores de Zod
                const formattedErrors = result.error.issues.map(issue => ({
                    field: issue.path.join('.') || 'general',
                    message: issue.message,
                    code: issue.code,
                    received: issue.received
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Datos de entrada inválidos',
                    details: formattedErrors
                });
            }

            // Datos validados - Zod infiere el tipo automáticamente
            // Datos validados - Zod infiere el tipo automáticamente
            if (source === 'params') {
                req.validatedParams = result.data;
            } else if (source === 'query') {
                req.validatedQuery = result.data;
            } else {
                req.validatedData = result.data;
            }
            next();

        } catch (error) {
            console.error('Error en validación:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno en validación',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

/**
 * Middleware para validar parámetros de URL
 */
export const validateParams = (schema) => {
    return validateRequest(schema, 'params');
};

/**
 * Middleware para validar query strings
 */
export const validateQuery = (schema) => {
    return validateRequest(schema, 'query');
};

/**
 * Middleware para validar headers
 */
export const validateHeaders = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.headers);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Headers inválidos',
                    details: result.error.issues
                });
            }

            req.validatedHeaders = result.data;
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error en validación de headers'
            });
        }
    };
};

/**
 * Middleware para validar archivos subidos
 */
export const validateFile = (options = {}) => {
    const {
        required = true,
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    } = options;

    return (req, res, next) => {
        try {
            // Si no hay archivo y es requerido
            if (required && (!req.file && !req.files)) {
                return res.status(400).json({
                    success: false,
                    error: 'Archivo requerido',
                    details: [{ field: 'file', message: 'Debe proporcionar un archivo' }]
                });
            }

            // Si no hay archivo pero no es requerido
            if (!req.file && !req.files) {
                return next();
            }

            // Validar archivo único
            const file = req.file || (Array.isArray(req.files) ? req.files[0] : req.files);

            // Validar tamaño
            if (file.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    error: 'Archivo muy grande',
                    details: [{
                        field: 'file',
                        message: `El archivo debe ser menor a ${maxSize / 1024 / 1024}MB`
                    }]
                });
            }

            // Validar tipo MIME
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    error: 'Tipo de archivo no permitido',
                    details: [{
                        field: 'file',
                        message: `Tipos permitidos: ${allowedTypes.join(', ')}`
                    }]
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error validando archivo'
            });
        }
    };
};

/**
 * Combinar múltiples validaciones
 */
export const validateMultiple = (...validators) => {
    return (req, res, next) => {
        const runValidator = (index) => {
            if (index >= validators.length) {
                return next();
            }

            validators[index](req, res, (err) => {
                if (err) {
                    return next(err);
                }
                runValidator(index + 1);
            });
        };

        runValidator(0);
    };
};