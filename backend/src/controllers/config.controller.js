// src/controllers/config.controller.js
import { ConfigService } from '../services/config.service.js';

const configService = new ConfigService();

export class ConfigController {

    /**
     * Actualizar tiempo de expiración del token
     */
    async actualizarTiempoExpiracion(req, res) {
        try {
            // ✅ Los datos YA están validados por Zod
            const { tiempo_expiracion } = req.validatedData;

            const configActualizada = await configService.actualizarTiempoExpiracion(tiempo_expiracion);

            res.status(200).json({
                success: true,
                message: 'Tiempo de expiración actualizado correctamente',
                configuracion: configActualizada
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al actualizar la configuración'
            });
        }
    }

    /**
     * Actualizar configuración de bloqueo
     */
    async actualizarConfigBloqueo(req, res) {
        try {
            // ✅ Los datos YA están validados por Zod
            const configData = req.validatedData;

            const configActualizada = await configService.actualizarConfigBloqueo(configData);

            res.status(200).json({
                success: true,
                message: 'Configuración de bloqueo actualizada correctamente',
                configuracion: configActualizada
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error al actualizar la configuración de bloqueo'
            });
        }
    }

    /**
     * Obtener configuración actual
     */
    async obtenerConfiguracion(req, res) {
        try {
            const configuracion = await configService.obtenerConfiguracionActual();

            res.status(200).json({
                success: true,
                configuracion
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener la configuración'
            });
        }
    }
}