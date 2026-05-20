// src/controllers/auth.controller.js
import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const authService = new AuthService();

export class AuthController {
    getCurrentUser = asyncHandler(async (req, res) => {
        // El ID del usuario viene del middleware verifyToken (req.user.id)
        const userId = req.user.id;

        // Llama al servicio para obtener los datos del usuario
        const usuario = await authService.getCurrentUser(userId);

        return res.status(200).json(
            ApiResponse.success({ usuario })
        );
    });

    login = asyncHandler(async (req, res) => {
        // Los datos ya están validados por el middleware
        const { email, password } = req.validatedData;

        // Llama al servicio para la lógica de negocio
        const result = await authService.login(email, password);

        // Si es el primer login, devolvemos el código especial
        if (result.code === 'FORCE_CHANGE_PASSWORD') {
            return res.status(200).json(
                ApiResponse.success({
                    code: result.code,
                    message: result.message,
                    tempToken: result.tempToken
                })
            );
        }

        // Login exitoso normal
        return res.status(200).json(
            ApiResponse.success({
                code: 'LOGIN_SUCCESS',
                token: result.token,
                usuario: result.usuario
            })
        );
    });

    forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.validatedData;

        // El servicio maneja la lógica de enviar el correo "en silencio"
        await authService.forgotPassword(email);

        // Siempre enviamos una respuesta positiva por seguridad silenciosa
        return res.status(200).json(
            ApiResponse.success(
                null,
                'Si tu email está registrado, recibirás un enlace de recuperación.'
            )
        );
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { token, newPassword } = req.validatedData;

        const result = await authService.resetPassword(token, newPassword);

        return res.status(200).json(
            ApiResponse.success(null, result.message)
        );
    });

    completeFirstPasswordChange = asyncHandler(async (req, res) => {
        // El ID del usuario lo inyecta el middleware 'verifyFirstLoginToken'
        const userId = req.user.id;
        const { newPassword } = req.validatedData;

        // El servicio se encarga de todo y devuelve la sesión completa
        const loginResult = await authService.completeFirstPasswordChange(userId, newPassword);

        return res.status(200).json(
            ApiResponse.success(loginResult)
        );
    });
}