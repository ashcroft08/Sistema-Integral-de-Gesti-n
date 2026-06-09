// src/routes/rutaCompra.routes.js
import { Router } from 'express';
import { RutaCompraController } from '../controllers/rutaCompra.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const controller = new RutaCompraController();

const bodegaAccess = [
    verifyToken,
    checkRole([ROLES.BODEGA, ROLES.ADMINISTRADOR, ROLES.SUPERUSUARIO])
];

/**
 * @route   POST /api/cacao/ruta-compra
 * @desc    Crear una ruta de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.post('/', bodegaAccess, controller.create);

/**
 * @route   GET /api/cacao/ruta-compra
 * @desc    Obtener todas las rutas de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.get('/', bodegaAccess, controller.getAll);

/**
 * @route   PUT /api/cacao/ruta-compra/:id
 * @desc    Actualizar una ruta de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.put('/:id', bodegaAccess, controller.update);

/**
 * @route   DELETE /api/cacao/ruta-compra/:id
 * @desc    Eliminar una ruta de compra
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.delete('/:id', bodegaAccess, controller.delete);

export default router;
