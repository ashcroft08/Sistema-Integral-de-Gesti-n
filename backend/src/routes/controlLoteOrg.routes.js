// src/routes/controlLoteOrg.routes.js
import { Router } from 'express';
import { ControlLoteOrgController } from '../controllers/controlLoteOrg.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const controller = new ControlLoteOrgController();

const produccionAccess = [
    verifyToken,
    checkRole([ROLES.BODEGA, ROLES.ADMINISTRADOR, ROLES.SUPERUSUARIO])
];

/**
 * @route   GET /api/cacao/control-lote-org
 * @desc    Obtener todos los controles de lote y comercialización orgánicos de un período
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.get('/', produccionAccess, controller.getAll);

/**
 * @route   PATCH /api/cacao/control-lote-org/:id
 * @desc    Actualizar un lote de control orgánico (odp, es_seco)
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.patch('/:id', produccionAccess, controller.update);

/**
 * @route   POST /api/cacao/control-lote-org/bulk-odp
 * @desc    Actualizar masivamente ODPs secuenciales
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.post('/bulk-odp', produccionAccess, controller.bulkUpdateOdp);

/**
 * @route   POST /api/cacao/control-lote-org/comercializacion
 * @desc    Guardar o actualizar los pesajes de comercialización de un lote
 * @access  Privado (Produccion/Bodega/Admin/Superusuario)
 */
router.post('/comercializacion', produccionAccess, controller.saveComercializacion);

export default router;
