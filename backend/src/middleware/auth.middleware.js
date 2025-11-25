import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para verificar el JWT estándar.
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No autorizado: Token no provisto' });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ message: 'No autorizado: Token inválido o expirado' });
        }

        // Normalizamos el payload
        req.user = {
            ...userPayload,
            id_usuario: userPayload.id_usuario ?? userPayload.id,
            // ✨ Aseguramos que rol_codigo esté disponible (lo inyectamos en AuthService)
            rol_codigo: userPayload.rol_codigo
        };

        next();
    });
};

/**
 * Middleware para verificar roles por CÓDIGO (Clean Code)
 * @param {Array<string>} rolesPermitidos - Ej: ['ROL_ADMIN', 'ROL_SUPER']
 */
export const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        // Validación defensiva
        // Ahora verificamos rol_codigo en lugar de id_rol
        if (!req.user || !req.user.rol_codigo) {
            return res.status(403).json({
                message: 'Acceso denegado: No se pudo identificar el código de rol del usuario.'
            });
        }

        const userRoleCode = req.user.rol_codigo;

        if (!rolesPermitidos.includes(userRoleCode)) {
            return res.status(403).json({
                message: `Acceso denegado. Se requieren permisos de administrador.`
            });
        }

        next();
    };
};

/**
 * Middleware para Token de Primer Ingreso (Set Password).
 */
export const verifyFirstLoginToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No autorizado: Token temporal no provisto' });
    }

    // CORRECCIÓN: Usamos la constante JWT_SECRET definida arriba
    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ message: 'No autorizado: Token temporal inválido o expirado' });
        }

        if (userPayload.type !== 'FIRST_LOGIN') {
            return res.status(403).json({ message: 'No autorizado: Este token no es válido para primer ingreso' });
        }

        req.user = userPayload;
        next();
    });
};