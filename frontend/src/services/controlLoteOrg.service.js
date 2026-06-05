import axiosInstance from './axios.js';

class ControlLoteOrgService {
    async getAll(id_periodo_compra) {
        if (!id_periodo_compra) {
            throw new Error('El id_periodo_compra es requerido');
        }
        const response = await axiosInstance.get(`/cacao/control-lote-org?id_periodo_compra=${id_periodo_compra}`);
        return response.data;
    }

    async update(id, data) {
        const response = await axiosInstance.patch(`/cacao/control-lote-org/${id}`, data);
        return response.data;
    }

    async bulkUpdateOdp(updates) {
        const response = await axiosInstance.post('/cacao/control-lote-org/bulk-odp', { updates });
        return response.data;
    }

    async saveComercializacion(data) {
        const response = await axiosInstance.post('/cacao/control-lote-org/comercializacion', data);
        return response.data;
    }
}

export const controlLoteOrgService = new ControlLoteOrgService();
