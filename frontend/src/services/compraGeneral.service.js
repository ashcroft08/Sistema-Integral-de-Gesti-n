import axiosInstance from './axios.js';

class CompraGeneralService {
    async upload(file, id_periodo_compra, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        if (id_periodo_compra) {
            formData.append('id_periodo_compra', id_periodo_compra);
        }
        
        const response = await axiosInstance.post('/cacao/compra-general/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });
        return response.data;
    }

    async getAll(page = 1, limit = 20, id_periodo_compra = null) {
        let url = `/cacao/compra-general?page=${page}&limit=${limit}`;
        if (id_periodo_compra) {
            url += `&id_periodo_compra=${id_periodo_compra}`;
        }
        const response = await axiosInstance.get(url);
        return response.data;
    }

    async deleteAll(id_periodo_compra = null) {
        let url = '/cacao/compra-general';
        if (id_periodo_compra) {
            url += `?id_periodo_compra=${id_periodo_compra}`;
        }
        const response = await axiosInstance.delete(url);
        return response.data;
    }

    async getPeriodos() {
        const response = await axiosInstance.get('/cacao/compra-general/periodos');
        return response.data;
    }

    async createPeriodo(data) {
        const response = await axiosInstance.post('/cacao/compra-general/periodos', data);
        return response.data;
    }

    async deletePeriodo(id) {
        const response = await axiosInstance.delete(`/cacao/compra-general/periodos/${id}`);
        return response.data;
    }

    async updatePeriodo(id, data) {
        const response = await axiosInstance.put(`/cacao/compra-general/periodos/${id}`, data);
        return response.data;
    }
}

export const compraGeneralService = new CompraGeneralService();
