// src/hooks/useUsers.js
import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import { validateFormData, CreateUserSchema, UpdateUserSchema } from '../schemas/user.schemas';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Cargar usuarios
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.getUsers();
            setUsers(response.usuarios || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cargar roles
    const loadRoles = async () => {
        try {
            const response = await userService.getRoles();
            setRoles(response.roles || []);
        } catch (err) {
            console.error('Error al cargar roles:', err);
        }
    };

    // Cargar estados (puedes crear un endpoint simple en el backend para esto o extraerlo de los usuarios cargados)
    const loadStatuses = async () => {
        try {
            // Si no tienes endpoint de estados, un truco "Clean" temporal es extraerlos de los usuarios únicos
            // Pero lo correcto es: const response = await userService.getUserStatuses();
            // Por ahora, asumiremos que el backend te permite obtener los estados disponibles.
            const response = await userService.getUserStatuses();
            setStatuses(response.estados || []);
        } catch (err) {
            console.error("Error cargando estados", err);
        }
    };

    // Crear usuario
    const createUser = async (userData) => {
        try {
            // Validar datos
            const validation = validateFormData(CreateUserSchema, userData);
            if (!validation.success) {
                throw new Error('Datos inválidos', { cause: validation.errors });
            }

            // No establecer loading para no bloquear la UI
            setError(null);
            const response = await userService.createUser(validation.data);
            // Recargar lista en background sin bloquear
            loadUsers().catch(err => {
                console.error('Error al recargar usuarios:', err);
                // No establecer error global, solo log
            });
            return response;
        } catch (err) {
            // Solo establecer error si es crítico, no para errores de validación
            if (!err.cause) {
                setError(err.message);
            }
            throw err;
        }
    };

    // Actualizar usuario
    const updateUser = async (id, userData) => {
        try {
            // Remover id_usuario si existe para evitar conflicto
            const { id_usuario, ...cleanUserData } = userData;

            // Validar datos
            const validation = validateFormData(UpdateUserSchema, cleanUserData);
            if (!validation.success) {
                throw new Error('Datos inválidos', { cause: validation.errors });
            }

            // No establecer loading para no bloquear la UI
            setError(null);
            const response = await userService.updateUser(id, validation.data);
            // Recargar lista en background sin bloquear
            loadUsers().catch(err => {
                console.error('Error al recargar usuarios:', err);
                // No establecer error global, solo log
            });
            return response;
        } catch (err) {
            console.error('Error en updateUser:', err);
            // Solo establecer error si es crítico, no para errores de validación
            if (!err.cause) {
                setError(err.message);
            }
            throw err;
        }
    };

    // Cambiar estado de usuario
    const changeUserStatus = async (id, statusData) => {
        try {
            // No establecer loading para no bloquear la UI
            setError(null);
            const response = await userService.changeUserStatus(id, statusData);
            // Recargar lista en background sin bloquear
            loadUsers().catch(err => {
                console.error('Error al recargar usuarios:', err);
                // No establecer error global, solo log
            });
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Eliminar usuario
    const deleteUser = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.deleteUser(id);
            await loadUsers(); // Recargar lista
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadUsers();
        loadRoles();
        loadStatuses(); // ✨ Cargamos los estados al inicio
    }, []);

    return {
        users,
        roles,
        statuses,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        changeUserStatus,
        reloadUsers: loadUsers
    };
};