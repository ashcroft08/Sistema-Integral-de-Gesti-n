// hooks/useClients.js - ACTUALIZADO
import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/client.service';
import { toast } from 'react-toastify';

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [catalogs, setCatalogs] = useState({ types: [] }); // ⚠️ Solo types, locations ya no
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar datos (Clientes + Tipos de Identificación)
    const loadClientData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Ejecutamos ambas peticiones en paralelo
            const [clientsResponse, catalogsResponse] = await Promise.all([
                clientService.getAllClients(),
                clientService.getFormCatalogs()
            ]);

            // Setear Clientes
            if (clientsResponse?.clients) {
                setClients(clientsResponse.clients);
            } else {
                setClients([]);
            }

            // Setear Catálogos (Solo tipos de identificación)
            if (catalogsResponse?.types) {
                setCatalogs({
                    types: catalogsResponse.types
                });
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

    // Crear Cliente
    const createClient = async (clientData) => {
        try {
            const response = await clientService.createClient(clientData);
            await loadClientData(); // Recargar lista
            return { success: true, data: response };
        } catch (err) {
            console.error("Error al crear cliente:", err);
            throw err; // Lanzar error para que ClientFormModal lo maneje
        }
    };

    // Actualizar Cliente
    const updateClient = async (id, clientData) => {
        try {
            const response = await clientService.updateClient(id, clientData);
            await loadClientData();
            return { success: true, data: response };
        } catch (err) {
            console.error("Error al actualizar cliente:", err);
            throw err; // Lanzar error para que ClientFormModal lo maneje
        }
    };

    // Carga inicial
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
        refresh: loadClientData
    };
};