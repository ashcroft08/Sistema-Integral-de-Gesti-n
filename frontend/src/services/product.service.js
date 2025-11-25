import axiosInstance from "./axios";

class ProductService {
    // Obtener todos los productos
    async getAllProducts() {
        try {
            const response = await axiosInstance.get('/products');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener producto por ID
    async getProductById(id) {
        try {
            const response = await axiosInstance.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nuevo producto
    async createProduct(productData) {
        try {
            const response = await axiosInstance.post('/products', productData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar producto
    async updateProduct(id, updateData) {
        try {
            const response = await axiosInstance.put(`/products/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cambiar estado de producto
    async changeProductStatus(id, statusData) {
        try {
            const response = await axiosInstance.patch(`/products/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ✨ ESTE ERA EL MÉTODO QUE FALTABA Y CAUSABA EL ERROR DE "is not a function"
    async getProductStatuses() {
        try {
            const response = await axiosInstance.get('/products/statuses');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async discontinueProduct(id) {
        try {
            const response = await axiosInstance.patch(`/products/${id}/discontinue`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async reactivateDiscontinuedProduct(id) {
        try {
            const response = await axiosInstance.patch(`/products/${id}/reactivate`);
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

export const productService = new ProductService();