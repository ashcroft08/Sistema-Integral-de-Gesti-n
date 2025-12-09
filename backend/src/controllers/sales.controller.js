// ============================================
// controllers/sales.controller.js
// ACTUALIZADO CON CLOUDINARY
// ============================================
import { SalesService } from '../services/sales.service.js';
import { StorageService } from '../services/storage.service.js';
import { Factura } from '../models/index.js';

const salesService = new SalesService();
const storageService = new StorageService();

export class SalesController {

    /**
     * Crear nueva venta con integración SRI
     */
    async createSale(req, res) {
        try {
            const saleData = req.validatedData;

            const dataWithSeller = {
                ...saleData,
                id_vendedor: req.user.id_usuario
            };

            const factura = await salesService.createSale(dataWithSeller);

            // ✅ FIX: Cargar factura completa con DetalleFactura
            const facturaCompleta = await salesService._cargarFacturaCompleta(factura.id_factura);

            res.status(201).json({
                success: true,
                message: 'Venta registrada correctamente. Procesando factura electrónica...',
                data: facturaCompleta, // ✅ CAMBIO: antes era "factura", ahora es "data"
                factura: facturaCompleta, // ✅ MANTENER RETROCOMPATIBILIDAD
                info: {
                    estado_sri: facturaCompleta.EstadoSri?.estado_sri,
                    secuencial: facturaCompleta.secuencial,
                    total: facturaCompleta.total,
                    xml_url: facturaCompleta.xml_firmado_url || 'Procesando...',
                    productos_vendidos: facturaCompleta.DetalleFactura?.length || 0
                }
            });

        } catch (error) {
            console.error('Error creating sale:', error);
            res.status(400).json({
                success: true,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Obtener catálogos (IVAs, Descuentos, Métodos de Pago)
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

    /**
     * Obtener historial de ventas con filtros
     */
    async getSalesHistory(req, res) {
        try {
            // req.validatedData contiene los query params validados
            const filtros = req.validatedData;
            const ventas = await salesService.getSalesHistory(filtros);

            res.status(200).json({
                success: true,
                count: ventas.length,
                ventas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener una factura por ID
     */
    async getInvoice(req, res) {
        try {
            // req.validatedData.id contiene el ID validado
            const { id } = req.validatedData;
            const factura = await salesService._cargarFacturaCompleta(id);

            if (!factura) {
                return res.status(404).json({
                    success: false,
                    message: 'Factura no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                factura
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Reenviar factura al SRI (para rechazadas/devueltas)
     */
    async resendToSri(req, res) {
        try {
            const { id } = req.validatedData;
            const resultado = await salesService.reenviarAlSri(id);

            res.status(200).json({
                success: true,
                ...resultado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Descargar XML de factura
     * Redirige a la URL de Cloudinary
     */
    async downloadXml(req, res) {
        try {
            const { id } = req.validatedData;
            const factura = await Factura.findByPk(id);

            if (!factura || !factura.xml_firmado_url) {
                return res.status(404).json({
                    success: false,
                    message: 'XML no disponible',
                    info: 'La factura aún no ha sido procesada o no tiene XML generado'
                });
            }

            // Redirigir a la URL de Cloudinary (pública y con CDN)
            res.redirect(factura.xml_firmado_url);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Anular factura (Solo Admin)
     */
    async cancelInvoice(req, res) {
        try {
            const { id } = req.validatedData;
            const resultado = await salesService.anularFactura(id);

            res.status(200).json({
                success: true,
                message: 'Factura anulada correctamente',
                ...resultado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * ✨ NUEVO: Obtener estadísticas de almacenamiento Cloudinary
     */
    async getStorageStats(req, res) {
        try {
            const stats = await storageService.getUsageStats();

            res.status(200).json({
                success: true,
                message: 'Estadísticas de almacenamiento',
                stats,
                alerts: [
                    stats.storage.percentage > 80 && {
                        level: 'warning',
                        message: `Uso de almacenamiento: ${stats.storage.percentage}% - Considera revisar archivos antiguos`
                    },
                    stats.bandwidth.percentage > 80 && {
                        level: 'warning',
                        message: `Uso de ancho de banda: ${stats.bandwidth.percentage}% - Revisa el tráfico`
                    }
                ].filter(Boolean)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas',
                error: error.message
            });
        }
    }
}