// src/routes/proveedor.routes.js
import { Router } from 'express';
import { ProveedorController } from '../controllers/proveedor.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const controller = new ProveedorController();

const bodegaAccess = [
    verifyToken,
    checkRole([ROLES.BODEGA, ROLES.ADMINISTRADOR, ROLES.SUPERUSUARIO])
];

/**
 * @route   POST /api/cacao/proveedor
 * @desc    Crear un proveedor para compra externa
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.post('/', bodegaAccess, controller.create);

/**
 * @route   GET /api/cacao/proveedor
 * @desc    Obtener listado de proveedores
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.get('/', bodegaAccess, controller.getAll);

export default router;
