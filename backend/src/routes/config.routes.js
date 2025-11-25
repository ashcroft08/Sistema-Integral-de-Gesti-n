// src/routes/config.routes.js
import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { ROLES } from '../constants/codigos.js';
import {
    TokenExpirationSchema,
    BlockConfigSchema
} from '../schemas/config.schemas.js';

const router = Router();
const configController = new ConfigController();

// Middleware de seguridad para administradores
const adminAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

/**
 * @route   PUT /api/config/token-expiration
 * @desc    Actualizar tiempo de expiración del token JWT
 * @access  Privado (Admin/Superusuario)
 */
router.put(
    '/token-expiration',
    adminAccess,
    validateRequest(TokenExpirationSchema), // ✅ Validación Zod
    (req, res) => configController.actualizarTiempoExpiracion(req, res)
);

/**
 * @route   PUT /api/config/block-config
 * @desc    Actualizar configuración de bloqueo de cuentas
 * @access  Privado (Admin/Superusuario)
 */
router.put(
    '/block-config',
    adminAccess,
    validateRequest(BlockConfigSchema), // ✅ Validación Zod
    (req, res) => configController.actualizarConfigBloqueo(req, res)
);

/**
 * @route   GET /api/config
 * @desc    Obtener configuración actual del sistema
 * @access  Privado (Admin/Superusuario)
 */
router.get(
    '/',
    adminAccess,
    (req, res) => configController.obtenerConfiguracion(req, res)
);

export default router;