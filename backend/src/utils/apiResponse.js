// src/utils/apiResponse.js
/**
 * Clase para estandarizar las respuestas de la API
 * Soporta auto-spreading de objetos para mantener retrocompatibilidad con las llaves de raíz del frontend.
 */
export class ApiResponse {
    constructor(success, message, data = null, errors = null) {
        this.success = success;
        this.message = message;

        if (data !== null) {
            // Si data es un objeto (pero no un Array o Date o Null), mezclamos sus campos en la raíz
            if (typeof data === 'object' && !Array.isArray(data) && data !== null && !(data instanceof Date)) {
                Object.assign(this, data);
            } else {
                this.data = data;
            }
        }

        if (errors !== null) this.errors = errors;
    }

    /**
     * Retorna una respuesta exitosa
     * @param {*} data - Datos o propiedades a incluir (si es un objeto, se mezclan en la raíz)
     * @param {string} message - Mensaje descriptivo
     */
    static success(data = null, message = 'Operación exitosa.') {
        return new ApiResponse(true, message, data);
    }

    /**
     * Retorna una respuesta de error
     * @param {string} message - Mensaje descriptivo del error
     * @param {*} errors - Detalles o desglose del error (ej. errores de validación de campos)
     */
    static error(message = 'Ha ocurrido un error.', errors = null) {
        return new ApiResponse(false, message, null, errors);
    }
}
