// src/routes/role.routes.js
import { Router } from 'express';
import { RoleController } from '../controllers/role.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const roleController = new RoleController();

// Middleware de seguridad (ejemplo: solo Admin puede ver roles)
const adminAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

/**
 * @route   GET /api/roles
 * @desc    Obtener todos los roles
 * @access  Privado (Admin)
 */
router.get('/', adminAccess, (req, res) => roleController.getAllRoles(req, res));

export default router;