// src/hooks/useConfig.js
import { useState, useEffect } from 'react';
import { configService } from '../services/config.service';
import { TokenExpirationFrontendSchema, BlockConfigFrontendSchema } from '../schemas/config.schemas';

export const useConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Cargar configuración inicial
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await configService.getConfig();
            setConfig(response.configuracion);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateTokenExpiration = async (expirationValue, expirationUnit) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Validar datos en frontend
            const validationResult = TokenExpirationFrontendSchema.safeParse({
                expirationValue,
                expirationUnit
            });

            if (!validationResult.success) {
                const errorMessage = validationResult.error.errors[0]?.message || 'Datos inválidos';
                throw new Error(errorMessage);
            }

            // Convertir formato para backend
            const backendTime = configService.convertToBackendFormat(expirationValue, expirationUnit);

            // Llamar al backend
            await configService.updateTokenExpiration(backendTime);

            setSuccess(true);
            await loadConfig();

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateBlockConfig = async (intentos_maximos, duracion_bloqueo_minutos) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Validar datos en frontend
            const validationResult = BlockConfigFrontendSchema.safeParse({
                intentos_maximos,
                duracion_bloqueo_minutos
            });

            if (!validationResult.success) {
                const errorMessage = validationResult.error.errors[0]?.message || 'Datos inválidos';
                throw new Error(errorMessage);
            }

            // Llamar al backend
            await configService.updateBlockConfig({
                intentos_maximos,
                duracion_bloqueo_minutos
            });

            setSuccess(true);
            await loadConfig();

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Función para convertir minutos a formato frontend (minutos/horas)
    const convertLockoutDurationToFrontend = (minutes) => {
        if (minutes >= 60) {
            return {
                duration: (minutes / 60).toString(),
                unit: 'Horas'
            };
        }
        return {
            duration: minutes.toString(),
            unit: 'Minutos'
        };
    };

    // Función para convertir formato frontend a minutos
    const convertLockoutDurationToBackend = (duration, unit) => {
        const durationNum = parseInt(duration);
        if (unit === 'Horas') {
            return durationNum * 60;
        }
        return durationNum;
    };

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(false);

    return {
        config,
        loading,
        error,
        success,
        updateTokenExpiration,
        updateBlockConfig,
        convertLockoutDurationToFrontend,
        convertLockoutDurationToBackend,
        clearError,
        clearSuccess,
        refetch: loadConfig
    };
};