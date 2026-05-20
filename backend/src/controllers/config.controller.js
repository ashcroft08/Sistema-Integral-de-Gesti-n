// src/controllers/config.controller.js
import { ConfigService } from '../services/config.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const configService = new ConfigService();

export class ConfigController {
    /**
     * Actualizar tiempo de expiración del token
     */
    actualizarTiempoExpiracion = asyncHandler(async (req, res) => {
        // ✅ Los datos YA están validados por Zod
        const { tiempo_expiracion } = req.validatedData;

        const configActualizada = await configService.actualizarTiempoExpiracion(tiempo_expiracion);

        return res.status(200).json(
            ApiResponse.success(
                { configuracion: configActualizada },
                'Tiempo de expiración actualizado correctamente'
            )
        );
    });

    /**
     * Actualizar configuración de bloqueo
     */
    actualizarConfigBloqueo = asyncHandler(async (req, res) => {
        // ✅ Los datos YA están validados por Zod
        const configData = req.validatedData;

        const configActualizada = await configService.actualizarConfigBloqueo(configData);

        return res.status(200).json(
            ApiResponse.success(
                { configuracion: configActualizada },
                'Configuración de bloqueo actualizada correctamente'
            )
        );
    });

    /**
     * Obtener configuración actual
     */
    obtenerConfiguracion = asyncHandler(async (req, res) => {
        const configuracion = await configService.obtenerConfiguracionActual();

        return res.status(200).json(
            ApiResponse.success({ configuracion })
        );
    });
}