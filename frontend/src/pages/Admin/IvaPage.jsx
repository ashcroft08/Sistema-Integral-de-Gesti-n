import React, { useState, useEffect, useMemo } from "react";
import { useIvas } from "../../hooks/useIvas.js";
import AdminLayout from "../../components/Layout/AdminLayout.jsx";
import Button from "../../components/UI/Button.jsx";
import Table from "../../components/UI/Table.jsx";
import TablePagination from "../../components/UI/TablePagination.jsx";
import IvaFormModal from "../../components/UI/IvaFormModal.jsx";
import IvaStatusModal from "../../components/UI/IvaStatusModal.jsx";
import { toast } from "react-toastify";

const IvaPage = () => {
  const { ivas, loading, error, createIva, updateIva, toggleIvaStatus } =
    useIvas();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- MODALES ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [currentIva, setCurrentIva] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Manejo de errores de carga inicial
  useEffect(() => {
    if (error && !loading && ivas.length === 0) {
      setInitialLoadError(error);
    } else {
      setInitialLoadError(null);
    }
  }, [error, loading, ivas.length]);

  // --- LÓGICA DE FILTRADO ---
  const filteredIvas = useMemo(() => {
    return ivas.filter((item) => {
      const term = searchTerm.toLowerCase();
      const codigo = item.codigo ? item.codigo.toLowerCase() : "";
      const descripcion = item.descripcion
        ? item.descripcion.toLowerCase()
        : "";

      const matchesSearch = codigo.includes(term) || descripcion.includes(term);

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = item.activo === true;
      if (statusFilter === "inactive") matchesStatus = item.activo === false;

      return matchesSearch && matchesStatus;
    });
  }, [ivas, searchTerm, statusFilter]);

  // --- LÓGICA DE ORDENAMIENTO ---
  const sortedIvas = useMemo(() => {
    let sortableItems = [...filteredIvas];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Para porcentajes, convertimos a número para ordenar correctamente
        if (sortConfig.key === "porcentaje_iva") {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredIvas, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // --- CÁLCULO DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIvas = sortedIvas.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = sortedIvas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- HANDLERS ---

  // 1. Abrir modal Crear/Editar
  const handleCreate = () => {
    setCurrentIva(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentIva(item);
    setIsFormModalOpen(true);
  };

  // 2. Abrir modal Cambio de Estado
  const openStatusModal = (item) => {
    setCurrentIva(item);
    setIsStatusModalOpen(true);
  };

  // 3. Confirmar Cambio de Estado
  const handleToggleStatus = async () => {
    if (!currentIva) return;
    setActionLoading(true);
    try {
      const result = await toggleIvaStatus(
        currentIva.id_iva,
        currentIva.activo
      );

      if (result.success) {
        toast.success(
          currentIva.activo
            ? "IVA desactivado correctamente"
            : "IVA activado correctamente"
        );
        setIsStatusModalOpen(false);
        setCurrentIva(null);
      } else {
        toast.error(result.error || "Error al cambiar el estado");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Guardar (Crear/Editar)
  const handleSave = async (data) => {
    setActionLoading(true);
    try {
      let result;
      if (currentIva) {
        result = await updateIva(currentIva.id_iva, data);
      } else {
        result = await createIva(data);
      }
      return result;
    } finally {
      setActionLoading(false);
    }
  };

  // --- COLUMNAS ---
  const columns = [
    {
      header: "Código SRI",
      accessorKey: "codigo",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
          {row.codigo}
        </span>
      ),
    },
    {
      header: "Porcentaje",
      accessorKey: "porcentaje_iva",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {row.porcentaje_iva}%
        </span>
      ),
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
    },
    {
      header: "Estado",
      accessorKey: "activo",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          {/* Botón Editar */}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors"
            title="Editar"
            disabled={actionLoading}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>

          {/* Botón Cambiar Estado */}
          <button
            onClick={() => openStatusModal(row)}
            className={`p-2 rounded-lg transition-colors ${
              row.activo
                ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
            }`}
            title={row.activo ? "Desactivar" : "Activar"}
            disabled={actionLoading}
          >
            <span className="material-symbols-outlined text-lg">
              {row.activo ? "toggle_off" : "toggle_on"}
            </span>
          </button>
        </div>
      ),
    },
  ];

  if (initialLoadError) {
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary dark:text-background-light">
            Configuración de Impuestos (IVA)
          </h1>
          <p className="text-text-secondary dark:text-background-light/60 mt-1">
            Gestiona los porcentajes de IVA permitidos por el SRI.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-6 py-3 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Porcentaje
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 p-4 bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm">
        {/* Buscador */}
        <div className="md:col-span-5 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/60 dark:text-background-light/60">
            search
          </span>
          <input
            type="search"
            className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-primary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro Estado */}
        <div className="md:col-span-3 relative">
          <select
            className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-3 pr-8 text-sm text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={currentIvas}
          isLoading={loading}
          keyField="id_iva"
          sortConfig={sortConfig}
          onSort={handleSort}
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
          emptyText="No hay valores de IVA configurados."
        />
      </div>

      {/* Modal de Crear/Editar */}
      <IvaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
        iva={currentIva}
      />

      {/* Modal de Cambio de Estado */}
      <IvaStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => !actionLoading && setIsStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        iva={currentIva}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
};

export default IvaPage;
