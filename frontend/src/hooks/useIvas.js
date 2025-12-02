import { useState, useEffect, useCallback } from 'react';
import { ivaService } from '../services/iva.service';
import { toast } from 'react-toastify';

export const useIvas = () => {
    const [ivas, setIvas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadIvas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await ivaService.getAll();
            if (response.success) {
                setIvas(response.ivas);
            }
        } catch (err) {
            setError(err.message);
            toast.error("Error al cargar los valores de IVA");
        } finally {
            setLoading(false);
        }
    }, []);

    const createIva = async (data) => {
        try {
            const response = await ivaService.create(data);
            if (response.success) {
                await loadIvas();
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const updateIva = async (id, data) => {
        try {
            const response = await ivaService.update(id, data);
            if (response.success) {
                await loadIvas();
                return { success: true };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // ✨ Toggle Status
    const toggleIvaStatus = async (id, currentStatus) => {
        try {
            const response = await ivaService.changeStatus(id, !currentStatus);
            if (response.success) {
                await loadIvas();
                return { success: true, message: response.message };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        loadIvas();
    }, [loadIvas]);

    return { ivas, loading, error, createIva, updateIva, toggleIvaStatus, refresh: loadIvas };
};