// src/services/user.service.js
import axiosInstance from './axios'; // 👈 Cambiado: ahora usa axios.js

export const userService = {

    // Obtener todos los usuarios
    async getUsers() {
        try {
            const response = await axiosInstance.get('/users');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Obtener usuario por ID
    async getUserById(id) {
        try {
            const response = await axiosInstance.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Crear usuario
    async createUser(userData) {
        try {
            const response = await axiosInstance.post('/users', userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Actualizar usuario
    async updateUser(id, userData) {
        try {
            const response = await axiosInstance.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Eliminar usuario
    async deleteUser(id) {
        try {
            const response = await axiosInstance.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Cambiar estado de usuario
    async changeUserStatus(id, statusData) {
        try {
            const response = await axiosInstance.patch(`/users/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Activar usuario
    async activateUser(id) {
        try {
            const response = await axiosInstance.patch(`/users/${id}/activate`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Desactivar usuario
    async deactivateUser(id) {
        try {
            const response = await axiosInstance.patch(`/users/${id}/deactivate`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Obtener roles
    async getRoles() {
        try {
            const response = await axiosInstance.get('/roles');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Actualizar configuración completa
     */
    async updateSettings(settingsData) {
        try {
            const response = await axiosInstance.put('/user-settings', settingsData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Obtener perfil del usuario actual
     */
    async getMyProfile() {
        try {
            const response = await axiosInstance.get('/user-settings/profile');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Actualizar solo el perfil
     */
    async updateProfile(profileData) {
        try {
            const response = await axiosInstance.put('/user-settings/profile', profileData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Cambiar solo la contraseña
     */
    async changePassword(passwordData) {
        try {
            const response = await axiosInstance.put('/user-settings/password', passwordData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async getUserStatuses() {
        try {
            const response = await axiosInstance.get('/users/statuses');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Manejo de errores mejorado
    handleError(error) {
        // Manejar errores de validación Zod del backend
        if (error.response?.data?.error === "Datos de entrada inválidos") {
            const zodErrors = error.response.data.details;
            const errorMessage = zodErrors.map((err) => err.message).join(", ");
            return new Error(errorMessage);
        }

        // Manejar otros errores del backend
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }

        if (error.response?.data) {
            return new Error(error.response.data.message || 'Error del servidor');
        } else if (error.request) {
            return new Error('No se pudo conectar con el servidor');
        } else {
            return new Error(error.message || 'Error desconocido');
        }
    }

};