// src/hooks/useUserSettings.js - ACTUALIZADO
import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';
import { toast } from 'react-toastify';

export const useUserSettings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ NUEVO: Función para obtener el perfil actualizado
    const getProfile = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.getMyProfile();
            return response;
        } catch (error) {
            const errorMessage = error.message || 'Error al obtener el perfil';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.updateProfile(profileData);
            toast.success('Perfil actualizado exitosamente.');
            return response;
        } catch (error) {
            const errorMessage = error.message || 'Error al actualizar el perfil';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const changePassword = useCallback(async (passwordData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.changePassword(passwordData);
            toast.success('Contraseña actualizada exitosamente.');
            return response;
        } catch (error) {
            const errorMessage = error.message || 'Error al cambiar la contraseña';
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getProfile, // ✅ EXPORTAR LA NUEVA FUNCIÓN
        updateProfile,
        changePassword,
    };
};