// src/utils/asyncHandler.js
/**
 * Envuelve una función asíncrona para capturar errores automáticamente y enviarlos al middleware de errores de Express.
 * Elimina la necesidad de usar bloques try-catch repetitivos en controladores.
 * 
 * @param {Function} fn - Controlador o middleware asíncrono
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
