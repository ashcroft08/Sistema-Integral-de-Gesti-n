// src/routes/controlLoteCv.routes.js
import { Router } from 'express';
import { ControlLoteCvController } from '../controllers/controlLoteCv.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const controller = new ControlLoteCvController();

const produccionAccess = [
    verifyToken,
    checkRole([ROLES.BODEGA, ROLES.ADMINISTRADOR, ROLES.SUPERUSUARIO])
];

/**
 * @route   GET /api/cacao/control-lote-cv
 * @desc    Obtener todos los controles de lote y comercialización convencionales de un período
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.get('/', produccionAccess, controller.getAll);

/**
 * @route   PATCH /api/cacao/control-lote-cv/:id
 * @desc    Actualizar un lote de control convencional (odp, es_seco)
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.patch('/:id', produccionAccess, controller.update);

/**
 * @route   POST /api/cacao/control-lote-cv/bulk-odp
 * @desc    Actualizar masivamente ODPs convencionales secuenciales
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.post('/bulk-odp', produccionAccess, controller.bulkUpdateOdp);

/**
 * @route   POST /api/cacao/control-lote-cv/comercializacion
 * @desc    Guardar o actualizar los pesajes de comercialización de un lote convencional
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.post('/comercializacion', produccionAccess, controller.saveComercializacion);

export default router;
