import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { toast } from 'react-toastify';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsResponse, categoriesResponse, statusesResponse] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
        productService.getProductStatuses()
      ]);

      // ✅ CORRECCIÓN: Manejo consistente de productos
      if (productsResponse && productsResponse.success !== false) {
        // Si la API devuelve {success: true, productos: [...]}
        // O {success: true, data: [...]} o simplemente el array
        setProducts(productsResponse.productos || productsResponse.data || productsResponse || []);
      } else if (productsResponse && productsResponse.success === false) {
        throw new Error(productsResponse.message || 'Error al cargar productos');
      } else {
        // Si la estructura es diferente o es array directo
        setProducts(productsResponse?.productos || productsResponse?.data || productsResponse || []);
      }

      // Categorías (mantener igual o similar corrección)
      if (categoriesResponse && categoriesResponse.success !== false) {
        setCategories(categoriesResponse.categorias || categoriesResponse.data || categoriesResponse || []);
      } else if (categoriesResponse && categoriesResponse.success === false) {
        // Opcional: manejar error específico para categorías
        console.error('Error cargando categorías:', categoriesResponse.message);
        setCategories([]);
      } else {
        setCategories(categoriesResponse?.categorias || categoriesResponse?.data || categoriesResponse || []);
      }

      // Estados (mantener igual o similar corrección)
      if (statusesResponse && statusesResponse.success !== false) {
        setStatuses(statusesResponse.estados || statusesResponse.data || statusesResponse || []);
      } else if (statusesResponse && statusesResponse.success === false) {
        console.error('Error cargando estados:', statusesResponse.message);
        setStatuses([]);
      } else {
        setStatuses(statusesResponse?.estados || statusesResponse?.data || statusesResponse || []);
      }

    } catch (err) {
      setError(err.message);
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

    // Reabastecer Stock (MOV_COMPRA)
    const addStock = async (id, cantidad) => {
        try {
            // Asumiendo que creaste el método en ProductService (ver abajo)
            const response = await productService.addStock(id, cantidad);
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
        addStock,
        refresh: loadInventoryData
    };
};