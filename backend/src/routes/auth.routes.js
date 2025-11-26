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
    (req, res) => authController.getCurrentUser(req, res)
);

// Ruta de login
router.post(
    '/login',
    validateRequest(LoginSchema),
    (req, res) => authController.login(req, res)
);

// Ruta para forgot password
router.post(
    '/forgot-password',
    validateRequest(ForgotPasswordSchema),
    (req, res) => authController.forgotPassword(req, res)
);

// Ruta para reset password CON CONFIRMACIÓN
router.post(
    '/reset-password',
    validateRequest(ResetPasswordWithConfirmationSchema),
    (req, res) => authController.resetPassword(req, res)
);

// Ruta para primer cambio de contraseña CON CONFIRMACIÓN
router.post(
    '/complete-password-change',
    verifyFirstLoginToken,
    validateRequest(ChangePasswordWithConfirmationSchema),
    (req, res) => authController.completeFirstPasswordChange(req, res)
);

export default router;