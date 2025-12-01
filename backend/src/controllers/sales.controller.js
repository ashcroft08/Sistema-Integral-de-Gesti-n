import { SalesService } from '../services/sales.service.js';

const salesService = new SalesService();

export class SalesController {

    /**
     * Crear nueva venta
     */
    async createSale(req, res) {
        try {
            // Se asume que req.body ya pasó por Zod (validación)
            const saleData = req.validatedData; // O req.body si no usas middleware Zod aquí aún

            // Asignar el vendedor desde el token (seguridad)
            // req.user viene del middleware verifyToken
            const dataWithSeller = {
                ...saleData,
                id_vendedor: req.user.id_usuario
            };

            const factura = await salesService.createSale(dataWithSeller);

            res.status(201).json({
                success: true,
                message: 'Venta registrada correctamente.',
                factura
            });

        } catch (error) {
            console.error('Error creating sale:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener datos necesarios para el formulario (Descuentos e IVA)
     */
    async getCatalogs(req, res) {
        try {
            const catalogs = await salesService.getSalesCatalogs();
            res.status(200).json({
                success: true,
                ...catalogs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}