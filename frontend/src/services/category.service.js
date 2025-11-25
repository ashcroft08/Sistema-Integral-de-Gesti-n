import axiosInstance from './axios';

class CategoryService {
    // Obtener todas las categorías
    async getAllCategories() {
        try {
            const response = await axiosInstance.get('/category-product');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener categoría por ID
    async getCategoryById(id) {
        try {
            const response = await axiosInstance.get(`/category-product/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nueva categoría
    async createCategory(categoryData) {
        try {
            const response = await axiosInstance.post('/category-product', categoryData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar categoría
    async updateCategory(id, updateData) {
        try {
            const response = await axiosInstance.put(`/category-product/${id}`, updateData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar categoría
    async deleteCategory(id) {
        try {
            const response = await axiosInstance.delete(`/category-product/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Cambiar estado de categoría
    async changeCategoryStatus(id, statusData) {
        try {
            const response = await axiosInstance.patch(`/category-product/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Activar categoría
    async activateCategory(id) {
        try {
            const response = await axiosInstance.patch(`/category-product/${id}/activate`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Desactivar categoría
    async deactivateCategory(id) {
        try {
            const response = await axiosInstance.patch(`/category-product/${id}/desactivate`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Manejo de errores
    handleError(error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('Error de conexión con el servidor');
        }
    }
}

export const categoryService = new CategoryService();