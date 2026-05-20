// src/controllers/userSettings.controller.js
import { UserSettingsService } from '../services/userSettings.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { UnauthorizedError, ValidationError } from '../utils/errors.js';

const userSettingsService = new UserSettingsService();

export class UserSettingsController {
    /**
     * Obtener perfil del usuario actual
     */
    getMyProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id_usuario || req.user?.id;

        if (!userId) {
            throw new UnauthorizedError('Usuario no autenticado.');
        }

        console.log('🔍 Obteniendo perfil para usuario ID:', userId);

        const usuario = await userSettingsService.getUserProfile(userId);

        return res.status(200).json(
            ApiResponse.success({ usuario })
        );
    });

    /**
     * Actualizar configuración del usuario
     */
    updateSettings = asyncHandler(async (req, res) => {
        const userId = req.user?.id_usuario || req.user?.id;

        if (!userId) {
            throw new UnauthorizedError('Usuario no autenticado.');
        }

        const settingsData = req.validatedData;

        // Validar que al menos un conjunto de datos esté presente
        if (!settingsData.profile && !settingsData.password) {
            throw new ValidationError('Debe proporcionar datos para actualizar el perfil o la contraseña.');
        }

        const results = await userSettingsService.updateUserSettings(userId, settingsData);

        // Construir respuesta
        const data = {};
        let message = 'Configuración actualizada exitosamente.';

        if (results.profile) {
            data.usuario = results.profile;
            message = results.password ?
                'Perfil y contraseña actualizados exitosamente.' :
                'Perfil actualizado exitosamente.';
        }

        if (results.password) {
            data.primer_ingreso = results.password.primer_ingreso;
            message = results.profile ?
                'Perfil y contraseña actualizados exitosamente.' :
                'Contraseña actualizada exitosamente.';
        }

        return res.status(200).json(
            ApiResponse.success({ data }, message)
        );
    });

    /**
     * Solo actualizar perfil
     */
    updateProfileOnly = asyncHandler(async (req, res) => {
        const userId = req.user?.id_usuario || req.user?.id;

        if (!userId) {
            throw new UnauthorizedError('Usuario no autenticado.');
        }

        const profileData = req.validatedData;

        const updatedUser = await userSettingsService.updateProfile(userId, profileData);

        return res.status(200).json(
            ApiResponse.success(
                { usuario: updatedUser },
                'Perfil actualizado exitosamente.'
            )
        );
    });

    /**
     * Solo cambiar contraseña
     */
    changePasswordOnly = asyncHandler(async (req, res) => {
        const userId = req.user?.id_usuario || req.user?.id;

        if (!userId) {
            throw new UnauthorizedError('Usuario no autenticado.');
        }

        const passwordData = req.validatedData;

        const result = await userSettingsService.changePassword(userId, passwordData);

        return res.status(200).json(
            ApiResponse.success(
                { primer_ingreso: result.primer_ingreso },
                result.message
            )
        );
    });
}