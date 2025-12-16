// components/UI/ClientSearchModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import ClientFormModal from "./ClientFormModal";
import { useClients } from "../../hooks/useClients";
import { toast } from "react-toastify";

const ClientSearchModal = ({ isOpen, onClose, onSelect }) => {
  const { clients, catalogs, loading, createClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // ✅ Filtrar clientes con múltiples identificaciones
  const filteredClients = searchTerm.trim()
    ? clients.filter((client) => {
        const term = searchTerm.toLowerCase().trim();
        const fullName = `${client.nombre} ${client.apellido}`.toLowerCase();

        // Buscar en todas las identificaciones
        const tieneIdentificacion = client.ClienteIdentificacions?.some(
          (ident) => ident.identificacion.includes(term)
        );

        return (
          fullName.includes(term) ||
          tieneIdentificacion ||
          client.email.toLowerCase().includes(term)
        );
      })
    : clients;

  const handleSelectClient = (client) => {
    onSelect(client);
    onClose();
  };

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleSaveNewClient = async (clientData) => {
    try {
      const result = await createClient(clientData);

      if (result.success) {
        toast.success("Cliente creado exitosamente");
        setIsCreating(false);

        if (result.data?.client) {
          onSelect(result.data.client);
          onClose();
        }

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(error.message || "Error al crear cliente");
      return { success: false, error: error.message };
    }
  };

  const footer = (
    <div className="flex items-center justify-between w-full gap-3">
      <Button variant="outline" onClick={onClose} className="flex-1">
        Cancelar
      </Button>
      <Button
        onClick={handleCreateNew}
        className="flex-1 inline-flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-base">person_add</span>
        Nuevo Cliente
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen && !isCreating}
        onClose={onClose}
        title="Seleccionar Cliente"
        footer={footer}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              search
            </span>
            <input
              type="search"
              placeholder="Buscar por nombre, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              autoFocus
            />
          </div>

          {searchTerm && (
            <div className="flex items-center justify-between text-sm text-text-secondary dark:text-background-light/70">
              <span>
                {filteredClients.length === 0
                  ? "No se encontraron clientes"
                  : `${filteredClients.length} cliente${
                      filteredClients.length !== 1 ? "s" : ""
                    } encontrado${filteredClients.length !== 1 ? "s" : ""}`}
              </span>
              {filteredClients.length === 0 && (
                <button
                  onClick={handleCreateNew}
                  className="text-primary hover:underline font-medium"
                >
                  Crear nuevo cliente
                </button>
              )}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-secondary/60">
                <span className="material-symbols-outlined text-5xl mb-3 text-primary/30">
                  {searchTerm ? "person_search" : "group"}
                </span>
                <p className="text-sm font-medium mb-1">
                  {searchTerm
                    ? "No se encontraron clientes con ese criterio"
                    : "No hay clientes registrados"}
                </p>
                <p className="text-xs text-text-secondary/50 mb-4">
                  {searchTerm
                    ? "Intenta con otro término de búsqueda o crea un nuevo cliente"
                    : "Comienza creando tu primer cliente"}
                </p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const identificacionPrincipal =
                  client.ClienteIdentificacions?.find((i) => i.es_principal) ||
                  client.ClienteIdentificacions?.[0];

                return (
                  <button
                    key={client.id_cliente}
                    onClick={() => handleSelectClient(client)}
                    className="w-full text-left p-4 border border-primary/10 rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                            person
                          </span>
                          <p className="font-semibold text-text-primary dark:text-background-light truncate">
                            {client.nombre} {client.apellido}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-secondary dark:text-background-light/70 mt-2">
                          {identificacionPrincipal && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                badge
                              </span>
                              <span className="truncate">
                                {identificacionPrincipal.identificacion}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              email
                            </span>
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              phone
                            </span>
                            <span>{client.celular}</span>
                          </div>
                          {client.parroquia && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                location_on
                              </span>
                              <span className="truncate">
                                {client.parroquia.parroquia}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors flex-shrink-0">
                        chevron_right
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {!searchTerm && clients.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg flex-shrink-0">
                  info
                </span>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Tip:</strong> Usa el buscador para encontrar clientes
                  rápidamente por nombre, cédula o email.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ClientFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={handleSaveNewClient}
        catalogs={catalogs}
      />
    </>
  );
};

export default ClientSearchModal;
