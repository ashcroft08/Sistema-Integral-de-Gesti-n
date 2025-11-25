// src/controllers/user.controller.js
import { UserService } from '../services/user.service.js';

const userService = new UserService();

export class UserController {

    /**
     * Crear usuario
     */
    async createUser(req, res) {
        try {
            // ✅ Los datos YA están validados por Zod middleware
            const userData = req.validatedData;

            const newUser = await userService.createUser(userData);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente.',
                usuario: newUser
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // src/controllers/user.controller.js

    /**
     * Obtener todos los usuarios (excluyendo al usuario logueado y id_rol = 1)
     */
    async getAllUsers(req, res) {
        try {
            const currentUserId = req.user.id_usuario; // Obtener ID del usuario logueado

            const usuarios = await userService.getAllUsers(currentUserId);

            res.status(200).json({
                success: true,
                usuarios
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener usuario por ID
     */
    async getUserById(req, res) {
        try {
            // ✅ El ID YA está validado por Zod middleware
            const { id } = req.validatedParams;

            const usuario = await userService.getUserById(id);

            res.status(200).json({
                success: true,
                usuario
            });

        } catch (error) {
            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Actualizar usuario
     */
    async updateUser(req, res) {
        try {
            // ✅ Datos y parámetros YA validados por Zod
            const { id } = req.validatedParams;
            const updateData = req.validatedData;

            const updatedUser = await userService.updateUser(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente.',
                usuario: updatedUser
            });

        } catch (error) {
            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Eliminar usuario
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.validatedParams;

            const result = await userService.deleteUser(id);

            res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
  * Cambiar estado de usuario
  */
    async changeUserStatus(req, res) {
        try {
            // ✅ Datos y parámetros YA validados por Zod
            const { id } = req.validatedParams;
            const { id_estado_usuario } = req.validatedData;

            const usuarioActualizado = await userService.changeUserStatus(
                id,
                id_estado_usuario
            );

            // ✅ Mensajes específicos según el estado
            const mensajesEstado = {
                1: 'Usuario activado exitosamente.',
                2: 'Usuario desactivado exitosamente.',
                3: 'Usuario bloqueado exitosamente.'
            };

            res.status(200).json({
                success: true,
                message: mensajesEstado[id_estado_usuario] || 'Estado actualizado exitosamente.',
                usuario: usuarioActualizado
            });

        } catch (error) {
            // ✅ Manejo específico de errores
            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('ID del estado') ||
                error.message.includes('último administrador')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al cambiar el estado del usuario.'
            });
        }


    }

    /**
     * Cambiar estado de usuario a activo
     */
    async activateUser(req, res) {
        try {
            const { id } = req.validatedParams;

            const usuario = await userService.changeUserStatus(id, 1); // 1 = Activo

            res.status(200).json({
                success: true,
                message: 'Usuario activado exitosamente.',
                usuario
            });

        } catch (error) {
            console.error('❌ Controlador - activateUser Error:', error.message);

            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('último administrador')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al activar el usuario.'
            });
        }
    }

    /**
     * Cambiar estado de usuario a inactivo
     */
    async deactivateUser(req, res) {
        try {
            const { id } = req.validatedParams;

            const usuario = await userService.changeUserStatus(id, 2); // 2 = Inactivo

            res.status(200).json({
                success: true,
                message: 'Usuario desactivado exitosamente.',
                usuario
            });

        } catch (error) {
            console.error('❌ Controlador - deactivateUser Error:', error.message);

            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('último administrador')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al desactivar el usuario.'
            });
        }
    }

    /**
 * Obtener perfil del usuario actual
 */
    async getMyProfile(req, res) {
        try {
            const userId = req.user.id_usuario; // Del middleware de autenticación

            const usuario = await userService.getUserById(userId);

            res.status(200).json({
                success: true,
                usuario
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Actualizar perfil del usuario actual
     */
    async updateMyProfile(req, res) {
        try {
            const userId = req.user.id_usuario;
            const updateData = req.validatedData;

            const updatedUser = await userService.updateUserProfile(userId, updateData);

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
                message: 'Error al actualizar el perfil'
            });
        }
    }

    /**
     * Cambiar contraseña del usuario actual
     */
    async changeMyPassword(req, res) {
        try {
            const userId = req.user.id_usuario;
            const { currentPassword, newPassword } = req.validatedData;

            const result = await userService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json({
                success: true,
                message: 'Contraseña actualizada exitosamente.'
            });

        } catch (error) {
            if (error.message === 'Usuario no encontrado.') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message === 'Contraseña actual incorrecta.') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al cambiar la contraseña'
            });
        }
    }

    /**
     * Obtener estados de usuario
     */
    async getUserStatuses(req, res) {
        try {
            const estados = await userService.getUserStatuses();
            res.status(200).json({
                success: true,
                estados // Devuelve array: [{ id: 1, nombre: 'Activo', codigo: 'ESTADO_ACTIVO' }, ...]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los estados de usuario'
            });
        }
    }
}