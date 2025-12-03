// pages/Admin/ClientsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
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
    refresh,
  } = useClients();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- 2. ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [initialLoadError, setInitialLoadError] = useState(null);

  // --- 3. EFECTO: RESETEAR PAGINACIÓN AL FILTRAR ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // --- LÓGICA DE FILTRADO ---
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const fullName = `${client.nombre || ""} ${
        client.apellido || ""
      }`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        client.identificacion
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.TipoIdentificacion?.tipo_identificacion
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        client.TipoIdentificacion?.tipo_identificacion === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [clients, searchTerm, typeFilter]);

  // --- LÓGICA DE ORDENAMIENTO ---
  const sortedClients = useMemo(() => {
    let sortableItems = [...filteredClients];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key]
          ? a[sortConfig.key].toString().toLowerCase()
          : "";
        let bValue = b[sortConfig.key]
          ? b[sortConfig.key].toString().toLowerCase()
          : "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredClients, sortConfig]);

  // --- 4. CÁLCULO DE DATOS PAGINADOS (SLICE) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Estos son los clientes que REALMENTE se verán en la tabla
  const currentClients = sortedClients.slice(indexOfFirstItem, indexOfLastItem);

  const totalItems = sortedClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- HANDLERS ---
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

  // --- COLUMNAS ---
  const columnsConfig = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
      render: (row) => `${row.nombre} ${row.apellido}`,
    },
    {
      header: "Identificación",
      accessorKey: "identificacion",
      sortable: true,
      className: "text-text-secondary dark:text-background-light/80",
    },
    {
      header: "Tipo",
      className: "text-text-secondary dark:text-background-light/80",
      render: (row) =>
        row.TipoIdentificacion?.tipo_identificacion || "Sin tipo",
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
          row.parroquia?.parroquia, // Acceso correcto ahora
          row.parroquia?.canton?.canton, // Acceso correcto ahora
          row.parroquia?.canton?.provincia?.provincia, // Acceso correcto ahora
        ]
          .filter(Boolean) // Filtra valores nulos/undefined
          .join(", ");
        return ubicacion || "Sin ubicación";
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => {
        return (
          <div className="inline-flex items-center justify-end gap-2">
            <button
              onClick={() => handleEditClient(row)}
              className="p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors"
              title="Editar cliente"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
        );
      },
    },
  ];

  // --- ERROR HANDLING ---
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
          {/* Buscador */}
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              search
            </span>
            <input
              type="search"
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              placeholder="Buscar por nombre, identificación, email o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filtro Tipo de Identificación */}
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
                  clients.map(
                    (client) => client.TipoIdentificacion?.tipo_identificacion
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
        </div>
        <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <Table
            columns={columnsConfig}
            data={currentClients} // --- 5. CAMBIO: Usamos 'currentClients' (los cortados)
            isLoading={loading}
            keyField="id_cliente"
            sortConfig={sortConfig}
            onSort={setSortConfig}
            // --- 5. AGREGADO: Paginación inyectada
            pagination={
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
            }
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
