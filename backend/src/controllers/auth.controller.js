// src/controllers/auth.controller.js
import { AuthService } from '../services/auth.service.js';
import {
    LoginSchema,
    ChangePasswordSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema
} from '../schemas/auth.schemas.js';

const authService = new AuthService();

export class AuthController {

    async login(req, res) {
        try {
            // Los datos ya están validados por el middleware
            const { email, password } = req.validatedData;

            // Llama al servicio para la lógica de negocio
            const result = await authService.login(email, password);

            // Si es el primer login, devolvemos el código especial
            if (result.code === 'FORCE_CHANGE_PASSWORD') {
                return res.status(200).json({
                    success: true,
                    code: result.code,
                    message: result.message,
                    tempToken: result.tempToken
                });
            }

            // Login exitoso normal
            res.status(200).json({
                success: true,
                code: 'LOGIN_SUCCESS',
                token: result.token,
                usuario: result.usuario
            });

        } catch (error) {
            // Si el servicio lanza un error (ej: "Credenciales inválidas"), lo atrapamos
            const statusCode = error.message.includes('bloqueada') ? 403 : 401;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error de autenticación'
            });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.validatedData;

            // El servicio maneja la lógica de enviar el correo "en silencio"
            await authService.forgotPassword(email);

            // Siempre enviamos una respuesta positiva
            res.status(200).json({
                success: true,
                message: 'Si tu email está registrado, recibirás un enlace de recuperación.'
            });

        } catch (error) {
            console.error('Error en forgotPassword controller:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor'
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.validatedData;

            const result = await authService.resetPassword(token, newPassword);

            res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al resetear la contraseña'
            });
        }
    }

    async completeFirstPasswordChange(req, res) {
        try {
            // El ID del usuario lo inyecta el middleware 'verifyFirstLoginToken'
            const userId = req.user.id;
            const { newPassword } = req.validatedData;

            // El servicio se encarga de todo y devuelve la sesión completa
            const loginResult = await authService.completeFirstPasswordChange(userId, newPassword);

            res.status(200).json({
                success: true,
                ...loginResult
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al actualizar la contraseña.'
            });
        }
    }
}