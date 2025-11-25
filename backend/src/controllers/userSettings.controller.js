// src/controllers/userSettings.controller.js
import { UserSettingsService } from '../services/userSettings.service.js';

const userSettingsService = new UserSettingsService();

export class UserSettingsController {


    // src/controllers/userSettings.controller.js - AGREGAR ESTE MÉTODO
    /**
     * Obtener perfil del usuario actual
     */
    async getMyProfile(req, res) {
        try {
            const userId = req.user.id_usuario;
            console.log('🔍 Obteniendo perfil para usuario ID:', userId);

            const usuario = await userSettingsService.getUserProfile(userId);

            res.status(200).json({
                success: true,
                usuario
            });

        } catch (error) {
            console.error('Error en getMyProfile:', error);

            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al obtener el perfil del usuario.'
            });
        }
    }

    /**
     * Actualizar configuración del usuario
     */
    async updateSettings(req, res) {
        try {

            const userId = req.user?.id_usuario || req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado.'
                });
            }

            const settingsData = req.validatedData;

            // Validar que al menos un conjunto de datos esté presente
            if (!settingsData.profile && !settingsData.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar datos para actualizar el perfil o la contraseña.'
                });
            }

            const results = await userSettingsService.updateUserSettings(userId, settingsData);

            // Construir respuesta
            const response = {
                success: true,
                message: 'Configuración actualizada exitosamente.',
                data: {}
            };

            if (results.profile) {
                response.data.usuario = results.profile;
                response.message = results.password ?
                    'Perfil y contraseña actualizados exitosamente.' :
                    'Perfil actualizado exitosamente.';
            }

            if (results.password) {
                response.data.primer_ingreso = results.password.primer_ingreso;
                response.message = results.profile ?
                    'Perfil y contraseña actualizados exitosamente.' :
                    'Contraseña actualizada exitosamente.';
            }

            res.status(200).json(response);

        } catch (error) {

            // Manejar errores específicos
            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('email ya está en uso') ||
                error.message.includes('contraseña actual es incorrecta') ||
                error.message.includes('nueva contraseña no puede ser igual')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al actualizar la configuración.'
            });
        }
    }

    /**
     * Solo actualizar perfil
     */
    async updateProfileOnly(req, res) {
        try {

            const userId = req.user?.id_usuario || req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado.'
                });
            }

            const profileData = req.validatedData;

            const updatedUser = await userSettingsService.updateProfile(userId, profileData);

            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente.',
                usuario: updatedUser
            });

        } catch (error) {

            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('email ya está en uso')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al actualizar el perfil.'
            });
        }
    }

    /**
     * Solo cambiar contraseña
     */
    async changePasswordOnly(req, res) {
        try {

            const userId = req.user?.id_usuario || req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado.'
                });
            }

            const passwordData = req.validatedData;

            const result = await userSettingsService.changePassword(userId, passwordData);

            res.status(200).json({
                success: true,
                message: result.message,
                primer_ingreso: result.primer_ingreso
            });

        } catch (error) {

            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('contraseña actual es incorrecta') ||
                error.message.includes('nueva contraseña no puede ser igual')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al cambiar la contraseña.'
            });
        }
    }
}