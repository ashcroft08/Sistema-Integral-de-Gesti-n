// hooks/useClients.js
import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/client.service';
import { toast } from 'react-toastify';

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [catalogs, setCatalogs] = useState({ types: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadClientData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [clientsResponse, catalogsResponse] = await Promise.all([
                clientService.getAllClients(),
                clientService.getFormCatalogs()
            ]);

            if (clientsResponse?.clients) {
                setClients(clientsResponse.clients);
            } else {
                setClients([]);
            }

            // ✅ CORREGIDO: El backend envía 'tipos'
            if (catalogsResponse?.tipos) {
                setCatalogs({ types: catalogsResponse.tipos });
            } else if (catalogsResponse?.types) {
                // Por si acaso el backend envía 'types'
                setCatalogs({ types: catalogsResponse.types });
            } else {
                setCatalogs({ types: [] });
            }

        } catch (err) {
            console.error("Error cargando clientes:", err);
            setError(err.message || "Error al cargar los clientes");
            toast.error("Error al cargar datos de clientes");
        } finally {
            setLoading(false);
        }
    }, []);

    const createClient = async (clientData) => {
        try {
            const response = await clientService.createClient(clientData);
            await loadClientData();
            return { success: true, data: response };
        } catch (err) {
            console.error("Error al crear cliente:", err);
            throw err;
        }
    };

    const updateClient = async (id, clientData) => {
        try {
            const response = await clientService.updateClient(id, clientData);
            await loadClientData();
            return { success: true, data: response };
        } catch (err) {
            console.error("Error al actualizar cliente:", err);
            throw err;
        }
    };

    const changeClientState = async (id, estadoCodigo) => {
        try {
            const response = await clientService.changeClientState(id, estadoCodigo);
            await loadClientData();
            return { success: true, data: response };
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            throw err;
        }
    };

    useEffect(() => {
        loadClientData();
    }, [loadClientData]);

    return {
        clients,
        catalogs,
        loading,
        error,
        createClient,
        updateClient,
        changeClientState,
        refresh: loadClientData
    };
};