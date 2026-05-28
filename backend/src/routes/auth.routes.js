// src/routes/auth.routes.js
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verifyFirstLoginToken, verifyToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
    LoginSchema,
    ChangePasswordWithConfirmationSchema,
    ForgotPasswordSchema,
    ResetPasswordWithConfirmationSchema 
} from '../schemas/auth.schemas.js';

const router = Router();
const authController = new AuthController();

// 🔥 NUEVA RUTA: Obtener datos del usuario autenticado
router.get(
    '/me',
    verifyToken,
    authController.getCurrentUser
);

// Ruta de login
router.post(
    '/login',
    validateRequest(LoginSchema),
    authController.login
);

// Ruta para forgot password
router.post(
    '/forgot-password',
    validateRequest(ForgotPasswordSchema),
    authController.forgotPassword
);

// Ruta para reset password CON CONFIRMACIÓN
router.post(
    '/reset-password',
    validateRequest(ResetPasswordWithConfirmationSchema),
    authController.resetPassword
);

// Ruta para primer cambio de contraseña CON CONFIRMACIÓN
router.post(
    '/complete-password-change',
    verifyFirstLoginToken,
    validateRequest(ChangePasswordWithConfirmationSchema),
    authController.completeFirstPasswordChange
);

export default router;