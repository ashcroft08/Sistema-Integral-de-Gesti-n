// src/utils/errors.js
/**
 * Clase base de error para la aplicación
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error de validación de datos (HTTP 400)
 */
export class ValidationError extends AppError {
    constructor(message, errors = null) {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * Error cuando un recurso no es encontrado (HTTP 404)
 */
export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado.') {
        super(message, 404);
    }
}

/**
 * Error de autenticación (HTTP 401)
 */
export class UnauthorizedError extends AppError {
    constructor(message = 'Acceso no autorizado.') {
        super(message, 401);
    }
}

/**
 * Error de autorización / permisos (HTTP 403)
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Acceso prohibido.') {
        super(message, 403);
    }
}

/**
 * Error de conflicto de estado, ej: registros duplicados (HTTP 409)
 */
export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
