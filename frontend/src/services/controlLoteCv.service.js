import axiosInstance from './axios.js';

class ControlLoteCvService {
    async getAll(id_periodo_compra) {
        if (!id_periodo_compra) {
            throw new Error('El id_periodo_compra es requerido');
        }
        const response = await axiosInstance.get(`/cacao/control-lote-cv?id_periodo_compra=${id_periodo_compra}`);
        return response.data;
    }

    async update(id, data) {
        const response = await axiosInstance.patch(`/cacao/control-lote-cv/${id}`, data);
        return response.data;
    }

    async bulkUpdateOdp(updates) {
        const response = await axiosInstance.post('/cacao/control-lote-cv/bulk-odp', { updates });
        return response.data;
    }

    async saveComercializacion(data) {
        const response = await axiosInstance.post('/cacao/control-lote-cv/comercializacion', data);
        return response.data;
    }
}

export const controlLoteCvService = new ControlLoteCvService();
