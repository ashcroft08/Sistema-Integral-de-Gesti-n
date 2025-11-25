import { Router } from 'express';
import { CategoryProductController} from '../controllers/category.controller.js'
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest, validateParams } from '../middleware/validation.middleware.js';
import { CategoryIdSchema, ChangeCategoryStatusSchema, CreateCategorySchema, UpdateCategorySchema } from '../schemas/category.schema.js';
import { ROLES } from '../constants/codigos.js';

const router = Router();
const categoryController = new CategoryProductController();

// Middleware de seguridad
const adminAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

/**
 * @route   POST /api/category
 * @desc    Crear nueva categoria
 * @access  Privado (Admin)
 */
router.post(
    '/',
    adminAccess,
    validateRequest(CreateCategorySchema), // ✅ Validación Zod
    (req, res) => categoryController.createCategory(req, res)
);


/**
 * @route   GET /api/category
 * @desc    Obtener todas las categorias
 * @access  Privado (Admin)
 */
router.get(
    '/',
    adminAccess,
    (req, res) => categoryController.getAllCategories(req, res)
);

/**
 * @route   GET /api/category/:id
 * @desc    Obtener categoria por ID
 * @access  Privado (Admin)
 */
router.get(
    '/:id',
    adminAccess,
    validateParams(CategoryIdSchema), // ✅ Validación Zod
    (req, res) => categoryController.getCategoryById(req, res)
);

/**
 * @route   PUT /api/category/:id
 * @desc    Actualizar categoria
 * @access  Privado (Admin)
 */
router.put(
    '/:id',
    adminAccess,
    validateParams(CategoryIdSchema), // ✅ Validación parámetros
    validateRequest(UpdateCategorySchema), // ✅ Validación body
    (req, res) => categoryController.updateCategory(req, res)
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Eliminar categoria
 * @access  Privado (Admin)
 */
router.delete(
    '/:id',
    adminAccess,
    validateParams(CategoryIdSchema), // ✅ Validación parámetros
    (req, res) => categoryController.deleteCategory(req, res)
);

/**
 * @route   PATCH /api/categories/:id/status
 * @desc    Cambiar estado de una categoria
 * @access  Privado (Admin)
 */
router.patch(
    '/:id/status',
    adminAccess,
    validateParams(CategoryIdSchema), // ✅ Validar ID
    validateRequest(ChangeCategoryStatusSchema), // ✅ Validar estado
    (req, res) => categoryController.changeCategoryStatus(req, res)
);

// Alternativa: Rutas específicas por acción
/**
 * @route   PATCH /api/categories/:id/activate
 * @desc    Activar categoria
 * @access  Privado (Admin)
 */
router.patch(
    '/:id/activate',
    adminAccess,
    validateParams(CategoryIdSchema),
    (req, res) => categoryController.activateCategory(req, res) // 1 = Activo
);

/**
 * @route   PATCH /api/categories/:id/desactivate  
 * @desc    Desactivar categoria
 * @access  Privado (Admin)
 */
router.patch(
    '/:id/desactivate',
    adminAccess,
    validateParams(CategoryIdSchema),
    (req, res) => categoryController.desactivateCategory(req, res) // 2 = Inactivo
);

export default router;