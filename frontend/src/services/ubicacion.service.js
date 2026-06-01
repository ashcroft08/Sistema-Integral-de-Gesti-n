import axiosInstance from "./axios";

class LocationService {
    // Obtener todas las provincias
    async getProvincias() {
        try {
            const response = await axiosInstance.get('/locations/provincias');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener cantones por provincia
    async getCantones(idProvincia) {
        try {
            const response = await axiosInstance.get(`/locations/provincias/${idProvincia}/cantones`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener parroquias por cantón
    async getParroquias(idCanton) {
        try {
            const response = await axiosInstance.get(`/locations/cantones/${idCanton}/parroquias`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ✅ NUEVO: Obtener ubicación completa por ID de parroquia
    async getLocationByParroquia(idParroquia) {
        try {
            const response = await axiosInstance.get(`/locations/parroquias/${idParroquia}/location`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener jerarquía completa (para formularios que la necesiten)
    async getFullHierarchy() {
        try {
            const response = await axiosInstance.get('/locations/hierarchy');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }
        return new Error('Error al cargar ubicaciones');
    }
}

export const locationService = new LocationService();