import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest, validateParams } from '../middleware/validation.middleware.js';
import { CreateProductSchema, UpdateProductSchema, ProductIdSchema, ChangeProductStatusSchema } from '../schemas/product.schemas.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const productController = new ProductController();

const adminOrSellerAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR, ROLES.VENDEDOR])
];
router.use(adminOrSellerAccess);

// 1️⃣ Obtener todos los productos
router.post(
    '/',
    validateRequest(CreateProductSchema),
    (req, res) => productController.createProduct(req, res)
);

router.get(
    '/',
    (req, res) => productController.getAllProducts(req, res)
);

router.get(
    '/statuses',
    (req, res) => productController.getProductStatuses(req, res)
);

// Descontinuar producto (requiere permisos de Admin/Super)
router.patch(
    '/:id/discontinue',
    validateParams(ProductIdSchema),
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR]), // Solo admins
    (req, res) => productController.discontinueProduct(req, res)
);

// Reactivar producto descontinuado
router.patch(
    '/:id/reactivate',
    validateParams(ProductIdSchema),
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR]),
    (req, res) => productController.reactivateDiscontinuedProduct(req, res)
);

// 3️⃣ Rutas específicas con parámetro :id
router.get(
    '/:id',
    validateParams(ProductIdSchema),
    (req, res) => productController.getProductById(req, res)
);

router.put(
    '/:id',
    validateParams(ProductIdSchema),
    validateRequest(UpdateProductSchema),
    (req, res) => productController.updateProduct(req, res)
);

router.patch(
    '/:id/status',
    validateParams(ProductIdSchema),
    validateRequest(ChangeProductStatusSchema),
    (req, res) => productController.changeProductStatus(req, res)
);

export default router;