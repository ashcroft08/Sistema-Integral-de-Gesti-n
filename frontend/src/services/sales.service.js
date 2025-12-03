// src/services/sales.service.js
import axiosInstance from './axios'; // Asegúrate de tener esta instancia configurada

class SalesService {
    /**
     * Crear una nueva venta
     * @param {Object} saleData - Datos de la venta
     * @param {number} saleData.id_cliente - ID del cliente
     * @param {number} saleData.id_vendedor - ID del vendedor (lo obtiene el backend del token)
     * @param {Array<Object>} saleData.productos - Array de productos vendidos
     * @param {number} saleData.productos[].id_producto - ID del producto
     * @param {number} saleData.productos[].cantidad - Cantidad vendida
     * @param {number} saleData.productos[].id_valor_iva - ID del valor de IVA aplicado
     * @param {number|null} [saleData.productos[].id_descuento] - ID del descuento aplicado (opcional)
     */
    async createSale(saleData) {
        try {
            const response = await axiosInstance.post('/sales', saleData);
            return response.data;
        } catch (error) {
            // Manejar error de conexión o respuesta
            if (error.response) {
                // El servidor respondió con un código de error
                const message = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
                throw new Error(message);
            } else if (error.request) {
                // No se recibió respuesta
                throw new Error('No se pudo conectar con el servidor.');
            } else {
                // Error de configuración
                throw new Error('Error de red o de solicitud.');
            }
        }
    }

    /**
     * Obtener catálogos necesarios para la creación de ventas (IVAs y Descuentos)
     */
    async getCatalogs() {
        try {
            const response = await axiosInstance.get('/sales/catalogs');
            return response.data;
        } catch (error) {
            if (error.response) {
                const message = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
                throw new Error(message);
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor para obtener catálogos.');
            } else {
                throw new Error('Error de red o de solicitud al obtener catálogos.');
            }
        }
    }

    // Puedes agregar otros métodos aquí como:
    // async getSalesHistory(filters) { ... }
    // async getSaleById(id) { ... }
}

// Exportar una instancia del servicio para usar directamente
export const salesService = new SalesService();