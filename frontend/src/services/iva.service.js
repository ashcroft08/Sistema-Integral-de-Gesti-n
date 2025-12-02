import axiosInstance from "./axios";

class IvaService {
    async getAll() {
        try {
            const response = await axiosInstance.get('/taxes');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async create(data) {
        try {
            const response = await axiosInstance.post('/taxes', data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(id, data) {
        try {
            const response = await axiosInstance.put(`/taxes/${id}`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async changeStatus(id, nuevoEstado) {
        try {
            const response = await axiosInstance.patch(`/taxes/${id}/status`, { activo: nuevoEstado });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        } else if (error.message) {
            return new Error(error.message);
        } else {
            return new Error('Error de conexión con el servidor');
        }
    }
}

export const ivaService = new IvaService();