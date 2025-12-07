import axiosInstance from './axios';

class CertificateService {
    async getAll() {
        try {
            const response = await axiosInstance.get('/certificates');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async upload(formData) {
        try {
            const response = await axiosInstance.post('/certificates/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deactivate(id) {
        try {
            const response = await axiosInstance.delete(`/certificates/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async activate(id) {
        try {
            const response = await axiosInstance.patch(`/certificates/${id}/activate`);
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

export const certificateService = new CertificateService();