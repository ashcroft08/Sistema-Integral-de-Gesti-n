import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/location.service';

export const useLocations = () => {
    const [provincias, setProvincias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProvincias();
    }, []);

    const loadProvincias = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await locationService.getProvincias();
            if (response.success) {
                setProvincias(response.provincias);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error cargando provincias:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCantones = useCallback(async (idProvincia) => {
        try {
            const response = await locationService.getCantones(idProvincia);
            return response.success ? response.cantones : [];
        } catch (err) {
            console.error('Error cargando cantones:', err);
            return [];
        }
    }, []);

    const getParroquias = useCallback(async (idCanton) => {
        try {
            const response = await locationService.getParroquias(idCanton);
            return response.success ? response.parroquias : [];
        } catch (err) {
            console.error('Error cargando parroquias:', err);
            return [];
        }
    }, []);

    // ✅ NUEVO: Obtener ubicación completa
    const getLocationByParroquia = useCallback(async (idParroquia) => {
        try {
            const response = await locationService.getLocationByParroquia(idParroquia);
            return response.success ? response.location : null;
        } catch (err) {
            console.error('Error cargando ubicación:', err);
            return null;
        }
    }, []);

    return {
        provincias,
        loading,
        error,
        getCantones,
        getParroquias,
        getLocationByParroquia // ✅ Exportar nueva función
    };
};
