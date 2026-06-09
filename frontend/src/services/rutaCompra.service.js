import axiosInstance from './axios.js';

class RutaCompraService {
    async getAll() {
        const response = await axiosInstance.get('/cacao/ruta-compra');
        return response.data;
    }

    async create(data) {
        const response = await axiosInstance.post('/cacao/ruta-compra', data);
        return response.data;
    }

    async update(id, data) {
        const response = await axiosInstance.put(`/cacao/ruta-compra/${id}`, data);
        return response.data;
    }
}

export const rutaCompraService = new RutaCompraService();
