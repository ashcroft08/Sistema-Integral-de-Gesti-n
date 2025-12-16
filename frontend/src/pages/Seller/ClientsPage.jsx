// pages/Admin/ClientsPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useClients } from "../../hooks/useClients";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/ui/Button";
import Table from "../../components/UI/Table";
import TablePagination from "../../components/UI/TablePagination";
import ClientFormModal from "../../components/ui/ClientFormModal";
import { toast } from "react-toastify";

const ClientsPage = () => {
  const { user } = useAuth();
  const {
    clients,
    catalogs,
    loading,
    error,
    createClient,
    updateClient,
    changeClientState,
    refresh,
  } = useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [initialLoadError, setInitialLoadError] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, stateFilter]);

  // ✅ Filtrado con múltiples identificaciones
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.nombre || ""} ${
      client.apellido || ""
    }`.toLowerCase();

    const identificacionesText =
      client.ClienteIdentificacions?.map(
        (ident) =>
          `${ident.identificacion} ${
            ident.TipoIdentificacion?.tipo_identificacion || ""
          }`
      )
        .join(" ")
        .toLowerCase() || "";

    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      identificacionesText.includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      client.ClienteIdentificacions?.some(
        (ident) => ident.TipoIdentificacion?.tipo_identificacion === typeFilter
      );

    // ✅ CORREGIDO: Usar estado_cliente (con alias)
    const matchesState =
      stateFilter === "all" || client.estado_cliente?.codigo === stateFilter;

    return matchesSearch && matchesType && matchesState;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
    let bValue = b[sortConfig.key]?.toString().toLowerCase() || "";

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = sortedClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = sortedClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleAddClient = () => {
    setCurrentClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (clientItem) => {
    setCurrentClient(clientItem);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (clientData.id_cliente) {
        await updateClient(clientData.id_cliente, clientData);
        toast.success("Cliente actualizado exitosamente");
      } else {
        await createClient(clientData);
        toast.success("Cliente creado exitosamente");
      }
      setIsModalOpen(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Error al guardar cliente";
      toast.error(errorMessage);
      return { success: false, errors: err.cause || { general: errorMessage } };
    }
  };

  // ✅ CORREGIDO: Cambiar estado del cliente
  const handleToggleState = async (client) => {
    const nuevoEstado =
      client.estado_cliente?.codigo === "CLIENTE_ACTIVO"
        ? "CLIENTE_INACTIVO"
        : "CLIENTE_ACTIVO";

    const estadoNombre =
      nuevoEstado === "CLIENTE_ACTIVO" ? "Activo" : "Inactivo";

    try {
      await changeClientState(client.id_cliente, nuevoEstado);
      toast.success(`Cliente marcado como ${estadoNombre}`);
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del cliente");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const columnsConfig = [
    {
      header: "Nombres",
      accessorKey: "nombre",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
    },
    {
      header: "Apellidos",
      accessorKey: "apellido",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
    },
    {
      header: "Identificaciones",
      className: "text-text-secondary dark:text-background-light/80",
      render: (row) => {
        const identificaciones = row.ClienteIdentificacions || [];
        if (identificaciones.length === 0) return "Sin identificación";

        return (
          <div className="flex flex-col gap-1">
            {identificaciones.map((ident, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-semibold">{ident.identificacion}</span>
                <span className="text-text-secondary/60 ml-1">
                  ({ident.TipoIdentificacion?.tipo_identificacion || "N/A"})
                </span>
                {ident.es_principal && (
                  <span className="ml-1 text-primary font-medium">★</span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "Email",
      accessorKey: "email",
      sortable: true,
      className: "text-text-secondary dark:text-background-light/80 break-all",
    },
    {
      header: "Celular",
      accessorKey: "celular",
      className: "text-text-secondary dark:text-background-light/80",
    },
    {
      header: "Ubicación",
      className: "text-text-secondary dark:text-background-light/80",
      render: (row) => {
        const ubicacion = [
          row.parroquia?.parroquia,
          row.parroquia?.canton?.canton,
          row.parroquia?.canton?.provincia?.provincia,
        ]
          .filter(Boolean)
          .join(", ");
        return ubicacion || "Sin ubicación";
      },
    },
    {
      header: "Estado",
      className: "text-center",
      render: (row) => {
        // ✅ CORREGIDO: Usar estado_cliente (con alias)
        const esActivo = row.estado_cliente?.codigo === "CLIENTE_ACTIVO";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              esActivo
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                esActivo ? "bg-green-600" : "bg-red-600"
              }`}
            />
            {row.estado_cliente?.nombre || "Desconocido"}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => {
        // ✅ CORREGIDO: Usar estado_cliente (con alias)
        const esActivo = row.estado_cliente?.codigo === "CLIENTE_ACTIVO";
        return (
          <div className="inline-flex items-center justify-end gap-2">
            <button
              onClick={() => handleEditClient(row)}
              className="p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors"
              title="Editar cliente"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={() => handleToggleState(row)}
              className={`p-2 rounded-lg transition-colors ${
                esActivo
                  ? "text-text-secondary/80 hover:text-red-600 dark:text-background-light/70 dark:hover:text-red-400"
                  : "text-text-secondary/80 hover:text-green-600 dark:text-background-light/70 dark:hover:text-green-400"
              }`}
              title={esActivo ? "Desactivar cliente" : "Activar cliente"}
            >
              <span className="material-symbols-outlined text-lg">
                {esActivo ? "block" : "check_circle"}
              </span>
            </button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (error && !loading && clients.length === 0) {
      setInitialLoadError(error);
    } else {
      setInitialLoadError(null);
    }
  }, [error, loading, clients.length]);

  if (initialLoadError && !loading && clients.length === 0) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-red-500">
          Error: {initialLoadError}
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Gestión de Clientes
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Busca, visualiza, edita y gestiona todos los clientes del sistema.
          </p>
        </div>
        <Button
          onClick={handleAddClient}
          className="inline-flex items-center gap-2 px-6 py-3 min-w-[180px] justify-center"
          disabled={loading}
        >
          <span className="material-symbols-outlined">person_add</span>
          {loading ? "Cargando..." : "Registrar Nuevo Cliente"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              search
            </span>
            <input
              type="search"
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              placeholder="Buscar por nombre, identificación o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              {[
                ...new Set(
                  clients.flatMap(
                    (client) =>
                      client.ClienteIdentificacions?.map(
                        (ident) => ident.TipoIdentificacion?.tipo_identificacion
                      ) || []
                  )
                ),
              ]
                .filter(Boolean)
                .map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              toggle_on
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="CLIENTE_ACTIVO">Activo</option>
              <option value="CLIENTE_INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <Table
            columns={columnsConfig}
            data={currentClients}
            isLoading={loading}
            keyField="id_cliente"
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        <div className="mt-2">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            limit={itemsPerPage}
            onLimitChange={(newLimit) => {
              setItemsPerPage(newLimit);
              setCurrentPage(1);
            }}
            totalItems={totalItems}
            showingFrom={indexOfFirstItem + 1}
            showingTo={Math.min(indexOfLastItem, totalItems)}
          />
        </div>
      </div>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={currentClient}
        catalogs={catalogs}
      />
    </AdminLayout>
  );
};

export default ClientsPage;
