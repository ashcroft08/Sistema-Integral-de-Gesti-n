// src/services/sales.service.js
import axiosInstance from './axios';

class SalesService {
    /**
     * Crear una nueva venta
     * @param {Object} saleData - Datos de la venta
     * @param {number} saleData.id_cliente - ID del cliente
     * @param {number} saleData.id_metodo_pago - ID del método de pago
     * @param {string} saleData.tipo_venta - 'CONTADO' o 'CREDITO'
     * @param {number} [saleData.plazo_credito_dias] - Plazo en días (solo si es CREDITO)
     * @param {string} [saleData.referencia_pago] - Referencia del pago (opcional)
     * @param {Array<Object>} saleData.productos - Array de productos vendidos
     */
    async createSale(saleData) {
        try {
            const response = await axiosInstance.post('/sales', saleData);
            return response.data;
        } catch (error) {
            if (error.response) {
                const message = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
                throw new Error(message);
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor.');
            } else {
                throw new Error('Error de red o de solicitud.');
            }
        }
    }

    /**
     * Obtener catálogos (IVAs, Descuentos, Métodos de Pago)
     */
    async getCatalogs() {
        try {
            const response = await axiosInstance.get('/sales/catalogs');
            return response.data;
        } catch (error) {
            if (error.response) {
                const message = error.response.data?.message || `Error ${error.response.status}`;
                throw new Error(message);
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor para obtener catálogos.');
            } else {
                throw new Error('Error al obtener catálogos.');
            }
        }
    }

    /**
     * Obtener historial de ventas
     */
    async getSalesHistory(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
            if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
            if (filters.id_vendedor) params.append('id_vendedor', filters.id_vendedor);
            if (filters.id_estado_sri) params.append('id_estado_sri', filters.id_estado_sri);
            if (filters.tipo_venta) params.append('tipo_venta', filters.tipo_venta);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await axiosInstance.get(`/sales/history?${params.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data?.message || 'Error al obtener historial');
            }
            throw new Error('Error de conexión al obtener historial');
        }
    }

    /**
     * Obtener una factura por ID
     */
    async getSaleById(id) {
        try {
            const response = await axiosInstance.get(`/sales/${id}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data?.message || 'Error al obtener factura');
            }
            throw new Error('Error de conexión');
        }
    }

    /**
     * Obtener cuentas por cobrar
     */
    async getCuentasPorCobrar(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.id_cliente) params.append('id_cliente', filters.id_cliente);
            if (filters.vencidas !== undefined) params.append('vencidas', filters.vencidas);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await axiosInstance.get(`/sales/cuentas-cobrar?${params.toString()}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data?.message || 'Error al obtener cuentas por cobrar');
            }
            throw new Error('Error de conexión');
        }
    }

    /**
     * Obtener detalle de una cuenta por cobrar
     */
    async getCuentaCobrarDetalle(id) {
        try {
            const response = await axiosInstance.get(`/sales/cuentas-cobrar/${id}`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data?.message || 'Error al obtener detalle');
            }
            throw new Error('Error de conexión');
        }
    }

    /**
     * Registrar un pago a una cuenta por cobrar
     */
    async registrarPago(idCuenta, pagoData) {
        try {
            const response = await axiosInstance.post(`/sales/cuentas-cobrar/${idCuenta}/pagar`, pagoData);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data?.message || 'Error al registrar pago');
            }
            throw new Error('Error de conexión');
        }
    }

    /**
     * Descargar XML de una factura
     */
    async downloadXml(id) {
        try {
            // El endpoint hace redirect, así que devolvemos la URL
            return `/api/sales/${id}/xml`;
        } catch (error) {
            throw new Error('Error al generar URL de descarga');
        }
    }

    /**
     * Reenviar factura al SRI (solo admin)
     */
    async resendToSri(id) {
        try {
            const response = await axiosInstance.post(`/sales/${id}/resend-sri`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data?.message || 'Error al reenviar al SRI');
            }
            throw new Error('Error de conexión');
        }
    }
}

// Exportar instancia singleton
export const salesService = new SalesService();