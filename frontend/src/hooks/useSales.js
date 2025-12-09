// src/hooks/useSales.js
import { useState, useCallback } from 'react';
import { salesService } from '../services/sales.service';
import { toast } from 'react-toastify';

export const useSales = () => {
    const [loading, setLoading] = useState(false);
    const [catalogs, setCatalogs] = useState({
        ivas: [],
        descuentos: [],
        metodosPago: [] // ✅ AGREGADO
    });

    // Cargar catálogos (IVAs, Descuentos, Métodos de Pago)
    const loadCatalogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await salesService.getCatalogs();
            if (response.success) {
                setCatalogs({
                    ivas: response.impuestos || [],
                    descuentos: response.descuentos || [],
                    metodosPago: response.metodosPago || [], // ✅ AGREGADO
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
                return { success: true, data: response.factura };
            } else {
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

    // Obtener historial de ventas
    const getSalesHistory = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const response = await salesService.getSalesHistory(filters);
            if (response.success) {
                return { success: true, data: response.ventas };
            } else {
                toast.error(response.message || 'Error al obtener historial.');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Error en useSales getSalesHistory:', error);
            toast.error(error.message || 'Error al obtener historial.');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener cuentas por cobrar
    const getCuentasPorCobrar = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const response = await salesService.getCuentasPorCobrar(filters);
            if (response.success) {
                return { success: true, data: response.cuentas };
            } else {
                toast.error(response.message || 'Error al obtener cuentas por cobrar.');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Error en useSales getCuentasPorCobrar:', error);
            toast.error(error.message || 'Error al obtener cuentas por cobrar.');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Registrar pago
    const registrarPago = useCallback(async (idCuenta, pagoData) => {
        setLoading(true);
        try {
            const response = await salesService.registrarPago(idCuenta, pagoData);
            if (response.success) {
                toast.success(response.message || 'Pago registrado exitosamente.');
                return { success: true, data: response.cuenta };
            } else {
                toast.error(response.message || 'Error al registrar pago.');
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Error en useSales registrarPago:', error);
            toast.error(error.message || 'Error al registrar pago.');
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
        getSalesHistory,
        getCuentasPorCobrar,
        registrarPago,
    };
};