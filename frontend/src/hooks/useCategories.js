import { useState, useEffect } from 'react';
import { categoryService } from '../services/category.service';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar todas las categorías
    const loadCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryService.getAllCategories();
            if (response.success) {
                setCategories(response.categorias || []);
            } else {
                throw new Error(response.message || 'Error al cargar categorías');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error loading categories:', err);
        } finally {
            setLoading(false);
        }
    };

    // Crear categoría
    const createCategory = async (categoryData) => {
        // No establecer loading para no bloquear la UI
        setError(null);
        try {
            const response = await categoryService.createCategory(categoryData);
            if (response.success) {
                // Recargar lista en background sin bloquear
                loadCategories().catch(err => {
                    console.error('Error al recargar categorías:', err);
                    // No establecer error global, solo log
                });
                return { success: true, data: response.categoria };
            } else {
                throw new Error(response.message || 'Error al crear categoría');
            }
        } catch (err) {
            // Solo establecer error si es crítico
            if (!err.cause) {
                setError(err.message);
            }
            return { success: false, error: err.message };
        }
    };

    // Actualizar categoría
    const updateCategory = async (id, updateData) => {
        // No establecer loading para no bloquear la UI
        setError(null);
        try {
            const response = await categoryService.updateCategory(id, updateData);
            if (response.success) {
                // Recargar lista en background sin bloquear
                loadCategories().catch(err => {
                    console.error('Error al recargar categorías:', err);
                    // No establecer error global, solo log
                });
                return { success: true, data: response.categoria || response.usuario };
            } else {
                throw new Error(response.message || 'Error al actualizar categoría');
            }
        } catch (err) {
            // Solo establecer error si es crítico
            if (!err.cause) {
                setError(err.message);
            }
            return { success: false, error: err.message };
        }
    };

    // Eliminar categoría
    const deleteCategory = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryService.deleteCategory(id);
            if (response.success) {
                await loadCategories(); // Recargar la lista
                return { success: true, message: response.message };
            } else {
                throw new Error(response.message || 'Error al eliminar categoría');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Cambiar estado de categoría
    const toggleCategoryStatus = async (id, currentStatus) => {
        // No establecer loading para no bloquear la UI
        setError(null);
        try {
            let response;
            if (currentStatus === 1) { // Si está activo, desactivar
                response = await categoryService.deactivateCategory(id);
            } else { // Si está inactivo, activar
                response = await categoryService.activateCategory(id);
            }

            if (response.success) {
                // Recargar lista en background sin bloquear
                loadCategories().catch(err => {
                    console.error('Error al recargar categorías:', err);
                    // No establecer error global, solo log
                });
                return { success: true, data: response.categoria || response.usuario };
            } else {
                throw new Error(response.message || 'Error al cambiar estado');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Cargar categorías al montar el hook
    useEffect(() => {
        loadCategories();
    }, []);

    return {
        categories,
        loading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        refetch: loadCategories
    };
};