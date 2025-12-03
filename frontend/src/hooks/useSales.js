// src/hooks/useSales.js
import { useState, useCallback } from 'react';
import { salesService } from '../services/sales.service';
import { toast } from 'react-toastify';

export const useSales = () => {
    const [loading, setLoading] = useState(false);
    const [catalogs, setCatalogs] = useState({ ivas: [], descuentos: [] });

    // Cargar catálogos
    const loadCatalogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await salesService.getCatalogs();
            if (response.success) {
                setCatalogs({
                    ivas: response.impuestos || [],
                    descuentos: response.descuentos || [],
                });
            } else {
                toast.error(response.message || 'Error al cargar catálogos.');
            }
        } catch (error) {
            console.error('Error en useSales loadCatalogs:', error);
            toast.error(error.message || 'Error al cargar catálogos.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear venta
    const createSale = useCallback(async (saleData) => {
        setLoading(true);
        try {
            const response = await salesService.createSale(saleData);
            if (response.success) {
                toast.success(response.message || 'Venta registrada exitosamente.');
                return { success: true, data: response.factura }; // Devolvemos la factura creada
            } else {
                // Si el backend devuelve un error específico
                toast.error(response.message || 'Error al registrar la venta.');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Error en useSales createSale:', error);
            toast.error(error.message || 'Error inesperado al registrar la venta.');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        catalogs,
        loadCatalogs,
        createSale,
    };
};