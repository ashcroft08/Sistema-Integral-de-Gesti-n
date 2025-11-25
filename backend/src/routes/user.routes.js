import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.middleware.js';
import { validateRequest, validateParams } from '../middleware/validation.middleware.js';
import { ROLES } from '../constants/codigos.js'; // ✨ IMPORTANTE: Traemos los códigos
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserIdSchema,
    ChangeUserStatusSchema,
} from '../schemas/user.schemas.js';

const router = Router();
const userController = new UserController();

// ✨ DEFINICIÓN DE ACCESOS:
// Ahora pasamos los CÓDIGOS, no los IDs.
// El middleware checkRole verificará: ['ROL_SUPER', 'ROL_ADMIN']
const adminAccess = [
    verifyToken,
    checkRole([ROLES.SUPERUSUARIO, ROLES.ADMINISTRADOR])
];

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario
 * @access  Privado (Admin/Super)
 */
router.post(
    '/',
    adminAccess,
    validateRequest(CreateUserSchema),
    (req, res) => userController.createUser(req, res)
);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Privado (Admin/Super)
 */
router.get(
    '/',
    adminAccess,
    (req, res) => userController.getAllUsers(req, res)
);

/**
 * @route   GET /api/users/statuses
 * @desc    Obtener catálogo de estados
 * @access  Privado
 */
router.get(
    '/statuses',
    adminAccess,
    (req, res) => userController.getUserStatuses(req, res)
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Privado (Admin/Super)
 */
router.get(
    '/:id',
    adminAccess,
    validateParams(UserIdSchema),
    (req, res) => userController.getUserById(req, res)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario
 * @access  Privado (Admin/Super)
 */
router.put(
    '/:id',
    adminAccess,
    validateParams(UserIdSchema),
    validateRequest(UpdateUserSchema),
    (req, res) => userController.updateUser(req, res)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario
 * @access  Privado (Admin/Super)
 */
router.delete(
    '/:id',
    adminAccess,
    validateParams(UserIdSchema),
    (req, res) => userController.deleteUser(req, res)
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Cambiar estado de un usuario
 * @access  Privado (Admin/Super)
 */
router.patch(
    '/:id/status',
    adminAccess,
    validateParams(UserIdSchema),
    validateRequest(ChangeUserStatusSchema),
    (req, res) => userController.changeUserStatus(req, res)
);

// Rutas individuales de activación/desactivación (si las necesitas)
router.patch(
    '/:id/activate',
    adminAccess,
    validateParams(UserIdSchema),
    (req, res) => userController.activateUser(req, res)
);

router.patch(
    '/:id/deactivate',
    adminAccess,
    validateParams(UserIdSchema),
    (req, res) => userController.deactivateUser(req, res)
);

export default router;