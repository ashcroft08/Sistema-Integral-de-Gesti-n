// src/services/auditoria.service.js
import { Auditoria, Error as ErrorModel } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Campos sensibles que se excluyen automáticamente de los parámetros auditados.
 * Nunca se persisten contraseñas, tokens o secretos en la tabla de auditoría.
 */
const CAMPOS_SENSIBLES = [
    'password', 'newPassword', 'currentPassword', 'confirmPassword', 'confirmNewPassword',
    'confirmarContrasena', 'contrasena', 'nuevaContrasena', 'contrasenaActual',
    'confirmarPassword', 'token', 'secret', 'tempToken'
];

/**
 * Elimina campos sensibles de un objeto para persistencia segura.
 * Soporta de forma robusta mayúsculas/minúsculas, normalización de caracteres en español (como 'ñ' y acentos)
 * y sanitización recursiva de objetos anidados y arreglos.
 * 
 * @param {Object} obj - Objeto a sanitizar (ej: req.body)
 * @returns {Object|null} Copia del objeto sanitizado
 */
export const sanitizarParams = (obj) => {
    if (obj === null || obj === undefined) return null;

    // Si es un arreglo, sanitizar cada elemento recursivamente
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizarParams(item));
    }

    // Si no es un objeto, devolver el valor directamente
    if (typeof obj !== 'object' || obj instanceof Date) {
        return obj;
    }

    const sanitizado = {};
    for (const [key, val] of Object.entries(obj)) {
        // Normalizar la clave: pasar a minúsculas y quitar acentos/eñes para comparación
        const lowerKey = key.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); // Normaliza 'ñ' a 'n' y remueve acentos

        const esSensible = CAMPOS_SENSIBLES.some(campo => {
            const campoNorm = campo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return lowerKey === campoNorm || lowerKey.includes(campoNorm);
        });

        if (esSensible) {
            sanitizado[key] = '[REDACTADO]';
        } else if (typeof val === 'object' && val !== null) {
            sanitizado[key] = sanitizarParams(val);
        } else {
            sanitizado[key] = val;
        }
    }
    return sanitizado;
};

/**
 * Extrae el nombre del módulo/recurso a partir de la URL de la petición.
 * Ejemplo: '/api/users/5/status' → 'users'
 * @param {string} url - req.originalUrl
 * @returns {string} Nombre del módulo
 */
export const extraerModulo = (url) => {
    if (!url) return 'desconocido';
    const segmentos = url.replace(/^\/api\//, '').split('/');
    return segmentos[0] || 'desconocido';
};

/**
 * Registra una acción en la tabla auditoria.auditoria.
 * Se ejecuta de forma fire-and-forget: nunca lanza excepciones al caller.
 * Si falla la escritura a BD, se loguea el error con pino como fallback.
 *
 * @param {Object} datos
 * @param {string} datos.accion - Tipo de acción (CREAR, ACTUALIZAR, ELIMINAR, etc.)
 * @param {string} [datos.descripcion] - Descripción legible de la acción
 * @param {number} [datos.id_usuario] - ID del usuario que ejecutó la acción
 * @param {string} [datos.usuario_nombre] - Nombre del usuario
 * @param {string} [datos.tabla] - Tabla/recurso afectado
 * @param {string} [datos.llave] - Llave primaria del registro afectado
 * @param {Object} [datos.valores_anteriores] - Estado previo (UPDATE/DELETE)
 * @param {Object} [datos.valores_nuevos] - Estado nuevo (INSERT/UPDATE)
 * @param {string} [datos.ip_direccion] - IP del cliente
 * @param {string} [datos.user_agent] - User-Agent del cliente
 */
export const registrarAccion = async (datos) => {
    try {
        await Auditoria.create({
            fecha: new Date(),
            accion: datos.accion,
            descripcion: datos.descripcion || null,
            id_usuario: datos.id_usuario || null,
            usuario_nombre: datos.usuario_nombre || null,
            tabla: datos.tabla || null,
            llave: datos.llave || null,
            valores_anteriores: datos.valores_anteriores || null,
            valores_nuevos: datos.valores_nuevos || null,
            ip_direccion: datos.ip_direccion || null,
            user_agent: datos.user_agent || null
        });
    } catch (error) {
        // Fallback: loguear con pino si falla la escritura a BD
        logger.error({
            msg: '⚠️ Error al registrar auditoría en BD (fallback a log)',
            auditoriaData: datos,
            error: error.message
        });
    }
};

/**
 * Registra un error en la tabla auditoria.error.
 * Se ejecuta de forma fire-and-forget: nunca lanza excepciones al caller.
 * Si falla la escritura a BD, se loguea con pino como fallback.
 *
 * @param {Object} datos
 * @param {string} [datos.modulo] - Módulo donde ocurrió el error
 * @param {string} datos.mensaje - Mensaje del error
 * @param {string} [datos.detalle] - Stack trace o detalles técnicos
 * @param {number} [datos.id_usuario] - ID del usuario (si estaba autenticado)
 * @param {string} [datos.usuario_nombre] - Nombre del usuario
 * @param {string} [datos.ruta] - Ruta/endpoint HTTP
 * @param {string} [datos.metodo] - Método HTTP (GET, POST, etc.)
 * @param {Object} [datos.parametros] - Parámetros de la petición (ya sanitizados)
 * @param {string} [datos.nivel] - Severidad: DEBUG, INFO, WARNING, ERROR, FATAL
 */
export const registrarError = async (datos) => {
    try {
        await ErrorModel.create({
            fecha: new Date(),
            modulo: datos.modulo || null,
            mensaje: datos.mensaje,
            detalle: datos.detalle || null,
            id_usuario: datos.id_usuario || null,
            usuario_nombre: datos.usuario_nombre || null,
            ruta: datos.ruta || null,
            metodo: datos.metodo || null,
            parametros: datos.parametros || null,
            nivel: datos.nivel || 'ERROR'
        });
    } catch (error) {
        // Fallback: loguear con pino si falla la escritura a BD
        logger.error({
            msg: '⚠️ Error al registrar error en BD (fallback a log)',
            errorData: datos,
            error: error.message
        });
    }
};
