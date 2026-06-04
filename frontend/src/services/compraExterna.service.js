import axiosInstance from './axios.js';

class CompraExternaService {
    async getAll(id_periodo_compra = null) {
        let url = '/cacao/compra-externa';
        if (id_periodo_compra) {
            url += `?id_periodo_compra=${id_periodo_compra}`;
        }
        const response = await axiosInstance.get(url);
        return response.data;
    }

    async create(data) {
        const response = await axiosInstance.post('/cacao/compra-externa', data);
        return response.data;
    }

    async update(id, data) {
        const response = await axiosInstance.put(`/cacao/compra-externa/${id}`, data);
        return response.data;
    }

    async delete(id) {
        const response = await axiosInstance.delete(`/cacao/compra-externa/${id}`);
        return response.data;
    }
}

export const compraExternaService = new CompraExternaService();
