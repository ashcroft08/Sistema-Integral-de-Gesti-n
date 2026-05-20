// src/middleware/error.middleware.js
import { AppError } from '../utils/errors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Middleware global de manejo de errores de Express
 */
export const errorHandler = (err, req, res, next) => {
    // Si la cabecera ya se envió, delegar al manejador por defecto de Express
    if (res.headersSent) {
        return next(err);
    }

    // 1. Manejo de AppError (Errores operativos controlados)
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            logger.error({
                message: err.message,
                statusCode: err.statusCode,
                path: req.originalUrl,
                method: req.method,
                stack: err.stack
            });
        } else {
            logger.warn({
                message: err.message,
                statusCode: err.statusCode,
                path: req.originalUrl,
                method: req.method
            });
        }

        return res.status(err.statusCode).json(
            ApiResponse.error(err.message, err.errors || null)
        );
    }

    // 2. Errores de sintaxis de JSON mal formado en la petición
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        logger.warn({
            message: 'JSON mal formado en la petición',
            path: req.originalUrl,
            method: req.method
        });
        return res.status(400).json(
            ApiResponse.error('El cuerpo de la petición contiene un JSON inválido.')
        );
    }

    // 3. Errores inesperados de base de datos u otras librerías
    logger.error({
        message: 'Error interno del servidor no controlado',
        error: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    return res.status(500).json(
        ApiResponse.error(
            isDev ? err.message : 'Ha ocurrido un error interno en el servidor.',
            isDev ? err.stack : null
        )
    );
};
