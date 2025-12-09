// src/pages/Admin/DiscountPage.jsx
import React, { useState, useEffect } from "react";
import { useDiscounts } from "../../hooks/useDiscounts";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Table from "../../components/UI/Table";
import TablePagination from "../../components/UI/TablePagination";
import DiscountFormModal from "../../components/UI/DiscountFormModal";
import DiscountStatusModal from "../../components/UI/DiscountStatusModal";
import { toast } from "react-toastify";

const DiscountPage = () => {
  const {
    discounts,
    loading,
    error,
    createDiscount,
    updateDiscount,
    toggleDiscountStatus,
  } = useDiscounts();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- MODALES ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Renombrado para claridad
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); // ✅ Estado para el modal de status

  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [actionLoading, setActionLoading] = useState(false); // ✅ Estado de carga para acciones
  const [initialLoadError, setInitialLoadError] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Manejo de errores de carga inicial
  useEffect(() => {
    if (error && !loading && discounts.length === 0) {
      setInitialLoadError(error);
    } else {
      setInitialLoadError(null);
    }
  }, [error, loading, discounts.length]);

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

  // --- LÓGICA DE FILTRADO (SIN useMemo) ---
  const filteredDiscounts = discounts.filter((item) => {
    const term = searchTerm.toLowerCase();
    // Verificamos que item.descuento y item.codigo existan antes de llamar a toLowerCase
    const discountName = item.descuento ? item.descuento.toLowerCase() : "";
    const discountCode = item.codigo ? item.codigo.toLowerCase() : "";

    const matchesSearch =
      discountName.includes(term) || discountCode.includes(term);

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = item.activo === true;
    if (statusFilter === "inactive") matchesStatus = item.activo === false;

    return matchesSearch && matchesStatus;
  });

  // --- LÓGICA DE ORDENAMIENTO (SIN useMemo) ---
  const sortedDiscounts = [...filteredDiscounts];
  if (sortConfig.key !== null) {
    sortedDiscounts.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

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
  const currentDiscounts = sortedDiscounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalItems = sortedDiscounts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- HANDLERS ---

  // 1. Abrir modal Crear/Editar
  const handleCreate = () => {
    setCurrentDiscount(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentDiscount(item);
    setIsFormModalOpen(true);
  };

  // 2. Abrir modal Cambio de Estado
  const openStatusModal = (item) => {
    setCurrentDiscount(item);
    setIsStatusModalOpen(true);
  };

  // 3. Confirmar Cambio de Estado (Lógica principal)
  const handleToggleStatus = async () => {
    if (!currentDiscount) return;
    setActionLoading(true);
    try {
      // Llamamos al hook pasando ID y el estado ACTUAL (el hook lo invierte)
      const result = await toggleDiscountStatus(
        currentDiscount.id_descuento,
        currentDiscount.activo
      );

      if (result.success) {
        toast.success(
          currentDiscount.activo
            ? "Descuento desactivado exitosamente"
            : "Descuento activado exitosamente"
        );
        setIsStatusModalOpen(false);
        setCurrentDiscount(null);
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
    setActionLoading(true); // Bloquear UI si es necesario
    try {
      let result;
      if (currentDiscount) {
        result = await updateDiscount(currentDiscount.id_descuento, data);
      } else {
        result = await createDiscount(data);
      }
      return result; // El modal maneja el toast basado en este retorno
    } finally {
      setActionLoading(false);
    }
  };

  // --- COLUMNAS ---
  const columns = [
    {
      header: "Nombre",
      accessorKey: "descuento",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
    },
    {
      header: "Código",
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
      accessorKey: "porcentaje_descuento",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {row.porcentaje_descuento}%
        </span>
      ),
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
        <div className="inline-flex items-center justify-end gap-2">
          {/* Botón Editar */}
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors"
            title="Editar"
            disabled={actionLoading}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>

          {/* Botón Cambiar Estado (Reemplaza a Eliminar) */}
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

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Descuentos
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Gestiona los descuentos aplicables en ventas.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-6 py-3 min-w-[180px] justify-center"
          disabled={loading}
        >
          <span className="material-symbols-outlined">add</span>
          {loading ? "Cargando..." : "Nuevo Descuento"}
        </Button>
      </div>

      {/* FILTROS */}
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
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro Estado */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={currentDiscounts}
            isLoading={loading}
            keyField="id_descuento"
            sortConfig={sortConfig}
            onSort={handleSort}
            emptyText="No se encontraron descuentos registrados."
          />
        </div>
      </div>

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

      {/* Modal de Crear/Editar */}
      <DiscountFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
        discount={currentDiscount}
      />

      {/* ✅ Nuevo Modal de Cambio de Estado */}
      <DiscountStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => !actionLoading && setIsStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        discount={currentDiscount}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
};

export default DiscountPage;
