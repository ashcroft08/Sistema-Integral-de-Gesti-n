import { Router } from 'express';
import { IvaController } from '../controllers/iva.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest, validateParams } from '../middleware/validation.middleware.js';
import { CreateIvaSchema, UpdateIvaSchema, IvaIdSchema } from '../schemas/iva.schema.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const ivaController = new IvaController();

// Middleware: Solo Admins pueden modificar la configuración de impuestos
const adminAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

// Lectura abierta a vendedores también (para cargar selects en ventas)
const readAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR, ROLES.CONTADOR])
];

router.get('/', readAccess, (req, res) => ivaController.getAll(req, res));

router.post('/',
    adminAccess,
    validateRequest(CreateIvaSchema),
    (req, res) => ivaController.create(req, res)
);

router.put('/:id',
    adminAccess,
    validateParams(IvaIdSchema),
    validateRequest(UpdateIvaSchema),
    (req, res) => ivaController.update(req, res)
);

router.patch('/:id/status',
    adminAccess,
    validateParams(IvaIdSchema),
    // Podrías validar el body aquí con un schema simple { activo: boolean }
    (req, res) => ivaController.changeStatus(req, res)
);

export default router;