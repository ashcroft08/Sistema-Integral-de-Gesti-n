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
    userController.createUser
);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Privado (Admin/Super)
 */
router.get(
    '/',
    adminAccess,
    userController.getAllUsers
);

/**
 * @route   GET /api/users/statuses
 * @desc    Obtener catálogo de estados
 * @access  Privado
 */
router.get(
    '/statuses',
    adminAccess,
    userController.getUserStatuses
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
    userController.getUserById
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
    userController.updateUser
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
    userController.deleteUser
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
    userController.changeUserStatus
);

// Rutas individuales de activación/desactivación (si las necesitas)
router.patch(
    '/:id/activate',
    adminAccess,
    validateParams(UserIdSchema),
    userController.activateUser
);

router.patch(
    '/:id/deactivate',
    adminAccess,
    validateParams(UserIdSchema),
    userController.deactivateUser
);

export default router;