// src/routes/userSettings.routes.js - AGREGAR ESTA RUTA
import { Router } from 'express';
import { UserSettingsController } from '../controllers/userSettings.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
    UpdateProfileSchema,
    ChangePasswordSchema,
    UserSettingsSchema
} from '../schemas/userSettings.schemas.js';

const router = Router();
const userSettingsController = new UserSettingsController();

/**
 * @route   GET /api/user-settings/profile
 * @desc    Obtener perfil del usuario actual
 * @access  Privado
 */
router.get(
    '/profile',
    verifyToken,
    (req, res) => userSettingsController.getMyProfile(req, res)
);

/**
 * @route   PUT /api/user-settings/profile
 * @desc    Actualizar solo el perfil
 * @access  Privado
 */
router.put(
    '/profile',
    verifyToken,
    validateRequest(UpdateProfileSchema),
    (req, res) => userSettingsController.updateProfileOnly(req, res)
);

/**
 * @route   PUT /api/user-settings/password
 * @desc    Cambiar solo la contraseña
 * @access  Privado
 */
router.put(
    '/password',
    verifyToken,
    validateRequest(ChangePasswordSchema),
    (req, res) => userSettingsController.changePasswordOnly(req, res)
);

export default router;