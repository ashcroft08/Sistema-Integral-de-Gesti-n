import { useState, useCallback } from 'react';
import { compraGeneralService } from '../services/compraGeneral.service';
import { toast } from 'react-toastify';

export const useComprasGenerales = () => {
    const [compras, setCompras] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    // Period states
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [resumenPeriodo, setResumenPeriodo] = useState(null);

    const fetchPeriodos = useCallback(async () => {
        try {
            setLoadingPeriodos(true);
            const response = await compraGeneralService.getPeriodos();
            const list = response.data || [];
            setPeriodos(list);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al cargar períodos';
            toast.error(message);
        } finally {
            setLoadingPeriodos(false);
        }
    }, []);

    const createPeriodo = useCallback(async (data) => {
        try {
            setLoading(true);
            const response = await compraGeneralService.createPeriodo(data);
            toast.success('Trimestre creado exitosamente');
            
            // Reload periods and select the newly created one
            const newPeriodId = response.data?.id_periodo_compra;
            if (newPeriodId) {
                setSelectedPeriod(newPeriodId);
            }
            await fetchPeriodos();
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al crear período';
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPeriodos]);

    const deletePeriodo = useCallback(async (id) => {
        try {
            setLoading(true);
            await compraGeneralService.deletePeriodo(id);
            toast.success('Trimestre eliminado correctamente');
            if (selectedPeriod === id) {
                setSelectedPeriod(null);
                setResumenPeriodo(null);
            }
            await fetchPeriodos();
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al eliminar período';
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPeriodos, selectedPeriod]);

    const updatePeriodo = useCallback(async (id, data) => {
        try {
            setLoading(true);
            const response = await compraGeneralService.updatePeriodo(id, data);
            toast.success('Trimestre actualizado correctamente');
            await fetchPeriodos();
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al actualizar período';
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchPeriodos]);

    const fetchCompras = useCallback(async (page = 1, limit = 20, periodId = selectedPeriod) => {
        if (!periodId) {
            setCompras([]);
            setTotal(0);
            setPagina(1);
            setTotalPaginas(0);
            setResumenPeriodo(null);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await compraGeneralService.getAll(page, limit, periodId);
            setCompras(response.compras || response.data?.compras || (Array.isArray(response.data) ? response.data : []));
            setTotal(response.total !== undefined ? response.total : (response.data?.total || 0));
            setPagina(response.pagina !== undefined ? response.pagina : (response.data?.pagina || page));
            setTotalPaginas(response.totalPaginas !== undefined ? response.totalPaginas : (response.data?.totalPaginas || 0));
            setResumenPeriodo(response.resumen || response.data?.resumen || null);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al cargar compras';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    const uploadFile = useCallback(async (file, periodId = selectedPeriod) => {
        if (!periodId) {
            toast.error('Por favor, selecciona un trimestre antes de subir el archivo');
            return;
        }
        try {
            setUploading(true);
            setUploadProgress(0);
            setUploadResult(null);
            setError(null);

            const response = await compraGeneralService.upload(file, periodId, (percent) => {
                setUploadProgress(percent);
            });

            const result = response.resultado || response.data?.resultado || response.data || response;
            setUploadResult(result);
            toast.success(response.message || 'Archivo procesado y normalizado exitosamente');

            // Reload data after successful upload
            await fetchCompras(1, 20, periodId);
            return response;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al subir archivo';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [fetchCompras, selectedPeriod]);

    const clearData = useCallback(async (periodId = selectedPeriod) => {
        if (!periodId) return;
        try {
            setLoading(true);
            setError(null);
            await compraGeneralService.deleteAll(periodId);
            toast.success('Datos del trimestre eliminados correctamente');
            setCompras([]);
            setTotal(0);
            setPagina(1);
            setTotalPaginas(0);
            setUploadResult(null);
            setResumenPeriodo(null);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Error al eliminar datos';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    return {
        compras,
        total,
        pagina,
        totalPaginas,
        loading,
        uploading,
        uploadProgress,
        uploadResult,
        error,
        
        // Period exports
        periodos,
        selectedPeriod,
        setSelectedPeriod,
        loadingPeriodos,
        resumenPeriodo,
        fetchPeriodos,
        createPeriodo,
        deletePeriodo,
        updatePeriodo,
        
        fetchCompras,
        uploadFile,
        clearData,
    };
};
