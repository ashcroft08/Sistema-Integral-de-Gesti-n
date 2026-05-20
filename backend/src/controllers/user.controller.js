// src/controllers/user.controller.js
import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const userService = new UserService();

export class UserController {

    /**
     * Crear usuario
     */
    createUser = asyncHandler(async (req, res) => {
        // Los datos ya están validados por Zod middleware
        const userData = req.validatedData;
        const newUser = await userService.createUser(userData);

        res.status(201).json(
            ApiResponse.success({ usuario: newUser }, 'Usuario creado exitosamente.')
        );
    });

    /**
     * Obtener todos los usuarios (excluyendo al usuario logueado y superusuario)
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const currentUserId = req.user.id_usuario; // Del middleware de autenticación
        const usuarios = await userService.getAllUsers(currentUserId);

        res.json(
            ApiResponse.success({ usuarios })
        );
    });

    /**
     * Obtener usuario por ID
     */
    getUserById = asyncHandler(async (req, res) => {
        const { id } = req.validatedParams;
        const usuario = await userService.getUserById(id);

        res.json(
            ApiResponse.success({ usuario })
        );
    });

    /**
     * Actualizar usuario
     */
    updateUser = asyncHandler(async (req, res) => {
        const { id } = req.validatedParams;
        const updateData = req.validatedData;
        const updatedUser = await userService.updateUser(id, updateData);

        res.json(
            ApiResponse.success({ usuario: updatedUser }, 'Usuario actualizado exitosamente.')
        );
    });

    /**
     * Eliminar usuario (soft delete)
     */
    deleteUser = asyncHandler(async (req, res) => {
        const { id } = req.validatedParams;
        const result = await userService.deleteUser(id);

        res.json(
            ApiResponse.success(null, result.message)
        );
    });

    /**
     * Cambiar estado de usuario
     */
    changeUserStatus = asyncHandler(async (req, res) => {
        const { id } = req.validatedParams;
        const { id_estado_usuario } = req.validatedData;

        const usuarioActualizado = await userService.changeUserStatus(id, id_estado_usuario);

        const mensajesEstado = {
            1: 'Usuario activado exitosamente.',
            2: 'Usuario desactivado exitosamente.',
            3: 'Usuario bloqueado exitosamente.'
        };

        res.json(
            ApiResponse.success(
                { usuario: usuarioActualizado },
                mensajesEstado[id_estado_usuario] || 'Estado actualizado exitosamente.'
            )
        );
    });

    /**
     * Cambiar estado de usuario a activo (1 = Activo)
     */
    activateUser = asyncHandler(async (req, res) => {
        const { id } = req.validatedParams;
        const usuario = await userService.changeUserStatus(id, 1);

        res.json(
            ApiResponse.success({ usuario }, 'Usuario activado exitosamente.')
        );
    });

    /**
     * Cambiar estado de usuario a inactivo (2 = Inactivo)
     */
    deactivateUser = asyncHandler(async (req, res) => {
        const { id } = req.validatedParams;
        const usuario = await userService.changeUserStatus(id, 2);

        res.json(
            ApiResponse.success({ usuario }, 'Usuario desactivado exitosamente.')
        );
    });

    /**
     * Obtener estados de usuario
     */
    getUserStatuses = asyncHandler(async (req, res) => {
        const estados = await userService.getUserStatuses();
        res.json(
            ApiResponse.success({ estados })
        );
    });
}