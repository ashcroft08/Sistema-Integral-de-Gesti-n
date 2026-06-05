import axiosInstance from './axios.js';

class ProveedorService {
    async getAll() {
        const response = await axiosInstance.get('/cacao/proveedor');
        return response.data;
    }

    async create(data) {
        const response = await axiosInstance.post('/cacao/proveedor', data);
        return response.data;
    }
}

export const proveedorService = new ProveedorService();
