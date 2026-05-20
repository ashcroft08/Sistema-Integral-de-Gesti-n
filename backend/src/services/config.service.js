// src/services/config.service.js
import { ConfiguracionToken, ConfiguracionBloqueo } from '../models/index.js';
import { NotFoundError } from '../utils/errors.js';

export class ConfigService {
    /**
     * Actualiza el tiempo de expiración del token
     */
    async actualizarTiempoExpiracion(nuevoTiempo) {
        // ✅ Buscar la configuración (asumimos id 1)
        const configToken = await ConfiguracionToken.findByPk(1);

        if (!configToken) {
            // Si no existe, la creamos
            const nuevaConfig = await ConfiguracionToken.create({
                id_token: 1,
                tiempo_expiracion: nuevoTiempo
            });
            return nuevaConfig;
        }

        // ✅ Actualizar
        configToken.tiempo_expiracion = nuevoTiempo;
        await configToken.save();

        return configToken;
    }

    /**
     * Actualiza configuración de bloqueo
     */
    async actualizarConfigBloqueo(datosConfig) {
        const { intentos_maximos, duracion_bloqueo_minutos } = datosConfig;

        // ✅ Buscar configuración (asumimos id 1)
        const config = await ConfiguracionBloqueo.findByPk(1);

        if (!config) {
            throw new NotFoundError('Configuración de bloqueo no encontrada.');
        }

        // ✅ Actualizar
        config.intentos_maximos = intentos_maximos;
        config.duracion_bloqueo_minutos = duracion_bloqueo_minutos;
        await config.save();

        return config;
    }

    /**
     * Obtener configuración actual
     */
    async obtenerConfiguracionActual() {
        const [configToken, configBloqueo] = await Promise.all([
            ConfiguracionToken.findByPk(1),
            ConfiguracionBloqueo.findByPk(1)
        ]);

        return {
            token: configToken,
            bloqueo: configBloqueo
        };
    }
}