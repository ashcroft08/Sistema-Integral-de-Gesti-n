import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { toast } from 'react-toastify';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // ✨ Necesario para el filtro por categoría
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statuses, setStatuses] = useState([]);

    // Cargar datos (Productos + Categorías)
    const loadInventoryData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ✨ Ejecutamos ambas peticiones en paralelo para velocidad
            const [productsResponse, categoriesResponse, statusesResponse] = await Promise.all([
                productService.getAllProducts(),
                categoryService.getAllCategories(),
                productService.getProductStatuses()
            ]);

            // Setear Productos
            if (productsResponse && productsResponse.length > 0) { // Ajusta según si tu back devuelve {success, productos} o array directo
                // Si tu controller devuelve { success: true, productos: [...] }
                setProducts(productsResponse.productos || productsResponse || []);
            } else if (productsResponse.productos) {
                setProducts(productsResponse.productos);
            } else {
                setProducts([]);
            }

            // Setear Categorías (Para el filtro)
            if (categoriesResponse && categoriesResponse.categorias) {
                setCategories(categoriesResponse.categorias);
            } else {
                setCategories([]);
            }

            // Setear Statuses
            if (statusesResponse && statusesResponse.estados) {
                setStatuses(statusesResponse.estados);
            } else {
                setStatuses([]);
            }

        } catch (err) {
            console.error("Error cargando inventario:", err);
            setError(err.message || "Error al cargar el inventario");
            toast.error("Error al cargar datos del inventario");
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear Producto
    const createProduct = async (productData) => {
        try {
            const response = await productService.createProduct(productData);
            await loadInventoryData(); // Recargar lista
            return { success: true, data: response };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Actualizar Producto
    const updateProduct = async (id, productData) => {
        try {
            const response = await productService.updateProduct(id, productData);
            await loadInventoryData();
            return { success: true, data: response };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Cambiar Estado (Lógica Genérica)
    const changeProductStatus = async (id, statusId) => {
        try {
            // El servicio espera { id_estado_producto: number }
            await productService.changeProductStatus(id, { id_estado_producto: statusId });
            await loadInventoryData();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };
    
    const discontinueProduct = async (id) => {
    try {
        const response = await productService.discontinueProduct(id);
        await loadInventoryData();
        return { success: true, data: response };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

const reactivateProduct = async (id) => {
    try {
        const response = await productService.reactivateDiscontinuedProduct(id);
        await loadInventoryData();
        return { success: true, data: response };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

    // Carga inicial
    useEffect(() => {
        loadInventoryData();
    }, [loadInventoryData]);

    return {
        products,
        categories,
        statuses,
        loading,
        error,
        createProduct,
        updateProduct,
        changeProductStatus,
        discontinueProduct,
        reactivateProduct,
        refresh: loadInventoryData
    };
};