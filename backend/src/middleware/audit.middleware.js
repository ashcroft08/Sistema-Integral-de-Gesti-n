// src/middleware/audit.middleware.js
import { registrarAccion, sanitizarParams, extraerModulo } from '../services/auditoria.service.js';

/**
 * Mapeo de métodos HTTP a tipos de acción de auditoría.
 */
const ACCION_POR_METODO = {
    POST: 'CREAR',
    PUT: 'ACTUALIZAR',
    PATCH: 'ACTUALIZAR_PARCIAL',
    DELETE: 'ELIMINAR'
};

/**
 * Mapeo de rutas específicas a acciones con nombre descriptivo.
 * Se evalúan en orden; la primera coincidencia gana.
 */
const ACCIONES_ESPECIALES = [
    { patron: /\/api\/auth\/login$/, metodo: 'POST', accion: 'INICIAR_SESION', descripcion: 'Inicio de sesión exitoso' },
    { patron: /\/api\/auth\/forgot-password$/, metodo: 'POST', accion: 'SOLICITAR_RECUPERACION', descripcion: 'Solicitud de recuperación de contraseña' },
    { patron: /\/api\/auth\/reset-password$/, metodo: 'POST', accion: 'RESTABLECER_CONTRASENA', descripcion: 'Restablecimiento de contraseña' },
    { patron: /\/api\/auth\/complete-password-change$/, metodo: 'POST', accion: 'CAMBIO_PRIMER_INGRESO', descripcion: 'Cambio de contraseña en primer ingreso' },
    { patron: /\/api\/users\/\d+\/status$/, metodo: 'PATCH', accion: 'CAMBIAR_ESTADO', descripcion: 'Cambio de estado de usuario' },
    { patron: /\/api\/users\/\d+\/activate$/, metodo: 'PATCH', accion: 'ACTIVAR_USUARIO', descripcion: 'Activación de usuario' },
    { patron: /\/api\/users\/\d+\/deactivate$/, metodo: 'PATCH', accion: 'DESACTIVAR_USUARIO', descripcion: 'Desactivación de usuario' },
    { patron: /\/api\/user-settings\/password$/, metodo: 'PUT', accion: 'CAMBIAR_CONTRASENA', descripcion: 'Cambio de contraseña propio' },
    { patron: /\/api\/user-settings\/profile$/, metodo: 'PUT', accion: 'ACTUALIZAR_PERFIL', descripcion: 'Actualización de perfil propio' },
];

/**
 * Busca una acción especial para la ruta y método dados.
 * @param {string} url - req.originalUrl
 * @param {string} metodo - req.method
 * @returns {{ accion: string, descripcion: string } | null}
 */
const buscarAccionEspecial = (url, metodo) => {
    for (const regla of ACCIONES_ESPECIALES) {
        if (regla.metodo === metodo && regla.patron.test(url)) {
            return { accion: regla.accion, descripcion: regla.descripcion };
        }
    }
    return null;
};

/**
 * Intenta extraer el ID del recurso afectado desde la URL.
 * Ejemplo: '/api/users/5' → '5'
 * @param {string} url
 * @returns {string|null}
 */
const extraerLlave = (url) => {
    // Buscar patrones como /api/recurso/:id o /api/recurso/:id/accion
    const match = url.match(/\/api\/[^/]+\/(\d+)/);
    return match ? match[1] : null;
};

/**
 * Middleware de auditoría automática para Express.
 *
 * Intercepta las respuestas exitosas de métodos de mutación (POST, PUT, PATCH, DELETE)
 * y registra la acción en la tabla auditoria.auditoria de forma asíncrona (fire-and-forget).
 *
 * - Solo audita mutaciones, no GETs
 * - No bloquea la respuesta al cliente
 * - Un fallo en la auditoría nunca afecta la operación principal
 */
export const auditMiddleware = (req, res, next) => {
    // Solo auditar métodos de mutación
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Guardar referencia al json original
    const originalJson = res.json.bind(res);

    // Override de res.json para interceptar la respuesta
    res.json = (body) => {
        // Restaurar el método original inmediatamente para evitar recursión
        res.json = originalJson;

        // Solo auditar respuestas exitosas (statusCode < 400)
        if (res.statusCode < 400) {
            // Determinar la acción
            const especial = buscarAccionEspecial(req.originalUrl, req.method);
            const accion = especial?.accion || ACCION_POR_METODO[req.method] || 'DESCONOCIDA';
            const descripcion = especial?.descripcion || `${accion} en ${extraerModulo(req.originalUrl)}`;

            // Obtener el usuario (req.user si ya estaba autenticado)
            let id_usuario = req.user?.id_usuario || req.user?.id || null;
            let usuario_nombre = req.user?.nombre || req.user?.usuario_nombre || null;

            // MEJORA: Si es inicio de sesión exitoso, extraer el usuario del cuerpo de la respuesta
            // Dado que ApiResponse.success propaga los campos en la raíz del objeto de respuesta,
            // el usuario se encuentra directamente en body.usuario.
            const u = body?.usuario || body?.data?.usuario;
            if (accion === 'INICIAR_SESION' && u) {
                id_usuario = u.id_usuario || u.id || id_usuario;
                usuario_nombre = u.nombre || u.usuario_nombre || u.email || usuario_nombre;
            }

            // Construir datos de auditoría (fire-and-forget, no await)
            registrarAccion({
                accion,
                descripcion,
                id_usuario,
                usuario_nombre,
                tabla: extraerModulo(req.originalUrl),
                llave: extraerLlave(req.originalUrl),
                valores_anteriores: null, // No disponible a nivel de middleware
                valores_nuevos: sanitizarParams(req.body),
                ip_direccion: req.ip || req.connection?.remoteAddress || null,
                user_agent: req.headers['user-agent'] || null
            });
        }

        // Enviar la respuesta original al cliente
        return originalJson(body);
    };

    next();
};
