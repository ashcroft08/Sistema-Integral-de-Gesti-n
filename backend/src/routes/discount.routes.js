import { Router } from 'express';
import { DiscountController } from '../controllers/discount.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest, validateParams } from '../middleware/validation.middleware.js';
import { CreateDiscountSchema, UpdateDiscountSchema, DiscountIdSchema } from '../schemas/discount.schema.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const discountController = new DiscountController();

// Middleware base: Autenticación requerida
router.use(verifyToken);

// 🔓 LECTURA: Permitido a Admins, Super, Vendedores y Contadores
const readAccess = checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR, ROLES.CONTADOR]);

router.get('/', readAccess, (req, res) => discountController.getAll(req, res));
router.get('/:id', readAccess, validateParams(DiscountIdSchema), (req, res) => discountController.getById(req, res));

// 🔒 ESCRITURA: Solo Admins y Superusuarios pueden gestionar descuentos
const adminAccess = checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR]);

router.post('/',
    adminAccess,
    validateRequest(CreateDiscountSchema),
    (req, res) => discountController.create(req, res)
);

router.put('/:id',
    adminAccess,
    validateParams(DiscountIdSchema),
    validateRequest(UpdateDiscountSchema),
    (req, res) => discountController.update(req, res)
);

router.patch('/:id/status',
    adminAccess,
    validateParams(DiscountIdSchema),
    (req, res) => discountController.changeStatus(req, res)
);

export default router;