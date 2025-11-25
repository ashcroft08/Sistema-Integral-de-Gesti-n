// src/services/config.service.js
import axiosInstance from './axios';

class ConfigService {
    /**
     * Obtener la configuración actual del sistema
     */
    async getConfig() {
        try {
            const response = await axiosInstance.get('/config');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Actualizar tiempo de expiración del token
     */
    async updateTokenExpiration(tiempo_expiracion) {
        try {
            const response = await axiosInstance.put('/config/token-expiration', {
                tiempo_expiracion
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Manejar errores de la API
     */
    handleError(error) {
        if (error.name === 'ConnectionError' || error.name === 'TimeoutError') {
            return error;
        }

        // Error de validación del backend
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }

        // Error genérico
        return new Error('Error de conexión con el servidor');
    }

    /**
     * Convertir formato frontend a backend para tiempo de expiración
     */
    convertToBackendFormat(value, unit) {
        const unitsMap = {
            'Minutos': 'm',
            'Horas': 'h',
            'Días': 'd'
        };

        return `${value}${unitsMap[unit]}`;
    }

    /**
     * Convertir formato backend a frontend para tiempo de expiración
     */
    convertToFrontendFormat(backendTime) {
        if (!backendTime) return { value: '30', unit: 'Horas' };

        const match = backendTime.match(/^(\d+)([smhd])$/);
        if (!match) return { value: '30', unit: 'Horas' };

        const value = match[1];
        const unitMap = {
            's': 'Minutos',
            'm': 'Minutos',
            'h': 'Horas',
            'd': 'Días'
        };

        return {
            value,
            unit: unitMap[match[2]]
        };
    }

    /**
   * Actualizar configuración de bloqueo
   */
    async updateBlockConfig(configData) {
        try {
            const response = await axiosInstance.put('/config/block-config', configData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Convertir minutos a formato frontend
     */
    convertMinutesToFrontend(minutes) {
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
    }

    /**
     * Convertir formato frontend a minutos
     */
    convertFrontendToMinutes(duration, unit) {
        const durationNum = parseInt(duration);
        if (unit === 'Horas') {
            return durationNum * 60;
        }
        return durationNum;
    }

}

export const configService = new ConfigService();