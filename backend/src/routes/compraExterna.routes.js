// src/routes/compraExterna.routes.js
import { Router } from 'express';
import { CompraExternaController } from '../controllers/compraExterna.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const controller = new CompraExternaController();

const bodegaAccess = [
    verifyToken,
    checkRole([ROLES.BODEGA, ROLES.ADMINISTRADOR, ROLES.SUPERUSUARIO])
];

/**
 * @route   POST /api/cacao/compra-externa
 * @desc    Crear una compra externa
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.post('/', bodegaAccess, controller.create);

/**
 * @route   GET /api/cacao/compra-externa
 * @desc    Obtener listado de compras externas
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.get('/', bodegaAccess, controller.getAll);

/**
 * @route   PUT /api/cacao/compra-externa/:id
 * @desc    Actualizar registro de compra externa
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.put('/:id', bodegaAccess, controller.update);

/**
 * @route   DELETE /api/cacao/compra-externa/:id
 * @desc    Eliminar registro de compra externa
 * @access  Privado (Bodega/Admin/Superusuario)
 */
router.delete('/:id', bodegaAccess, controller.delete);

export default router;
