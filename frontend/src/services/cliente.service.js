// services/client.service.js
import axiosInstance from "./axios";

class ClientService {
    // Obtener todos los clientes
    async getAllClients() {
        try {
            const response = await axiosInstance.get('/clients');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener cliente por ID
    async getClientById(id) {
        try {
            const response = await axiosInstance.get(`/clients/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nuevo cliente
    async createClient(clientData) {
        try {
            const response = await axiosInstance.post('/clients', clientData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar cliente
    async updateClient(id, updateData) {
        try {
            const response = await axiosInstance.put(`/clients/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ✅ NUEVO: Cambiar estado del cliente
    async changeClientState(id, estadoCodigo) {
        try {
            const response = await axiosInstance.patch(`/clients/${id}/state`, {
                estado_codigo: estadoCodigo
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener catálogos (tipos de identificación)
    async getFormCatalogs() {
        try {
            const response = await axiosInstance.get('/clients/catalogs');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Manejo de errores
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

export const clientService = new ClientService();