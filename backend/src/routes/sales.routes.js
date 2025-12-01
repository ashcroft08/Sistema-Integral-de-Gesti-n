import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { CreateSaleSchema } from '../schemas/sales.schema.js'; // Necesitas crear este Zod schema
import { ROLES } from '../constants/codigos.js';

const router = Router();
const salesController = new SalesController();

// Middleware común: Solo Vendedores, Admins o Superusuarios pueden vender
const salesAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR])
];

router.use(salesAccess);

// 1. Obtener catálogos (IVAs y Descuentos) para cargar el select del frontend
router.get('/catalogs', (req, res) => salesController.getCatalogs(req, res));

// 2. Crear Venta
router.post(
    '/',
    validateRequest(CreateSaleSchema), // Importante validar estructura
    (req, res) => salesController.createSale(req, res)
);

export default router;