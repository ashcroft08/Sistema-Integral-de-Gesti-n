import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";
import Table from "../../components/UI/Table"; // ✅ Componente de Tabla Reutilizable
import CategoryStatusModal from "../../components/UI/CategoryStatusModal"; // ✅ Modal de Estado Bonito
import { useCategories } from "../../hooks/useCategories";
import { toast } from "react-toastify";
import { ESTADOS_CATEGORIA } from "../../constants/statuses";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  getValidationError,
} from "../../schemas/category.schemas";

const CategoriesPage = () => {
  const { user } = useAuth();
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
  } = useCategories();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // ✅ 1. Estado para ordenar

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [formData, setFormData] = useState({ categoria: "" });
  const [formErrors, setFormErrors] = useState({});
  const [currentCategory, setCurrentCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState(null);

  // Verifica el código que viene del backend (incluido en getAllCategories)
  const isCategoryActive = (row) =>
    row?.EstadoCategoria?.codigo === ESTADOS_CATEGORIA.ACTIVA;

  // --- LÓGICA DE FILTRADO (useMemo) ---
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // ✅ 2. LÓGICA DE ORDENAMIENTO
  const sortedCategories = useMemo(() => {
    let sortableItems = [...filteredCategories];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Manejo seguro de valores nulos
        let aValue =
          a[sortConfig.key] !== undefined && a[sortConfig.key] !== null
            ? a[sortConfig.key]
            : "";
        let bValue =
          b[sortConfig.key] !== undefined && b[sortConfig.key] !== null
            ? b[sortConfig.key]
            : "";

        // Si son strings, comparar lowercase, si son números comparar valor
        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCategories, sortConfig]);

  // ✅ 3. HANDLER PARA CLIC EN CABECERA
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // --- EFECTOS ---
  useEffect(() => {
    if (error && !loading) {
      if (categories.length === 0) {
        setInitialLoadError(error);
      }
    } else {
      setInitialLoadError(null);
    }
  }, [error, loading, categories.length]);

  // --- HANDLERS ---

  // 1. Crear Categoría
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setActionLoading(true);
    try {
      const validatedData = CreateCategorySchema.parse(formData);
      const result = await createCategory(validatedData);

      if (result.success) {
        toast.success("Categoría creada exitosamente");
        setIsCreateModalOpen(false);
        setFormData({ categoria: "" });
      } else {
        toast.error(result.error || "Error al crear categoría");
        setFormErrors({ submit: result.error });
      }
    } catch (error) {
      const validationError = getValidationError(error);
      toast.error(validationError);
      setFormErrors({ submit: validationError });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Editar Categoría
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setActionLoading(true);
    try {
      const validatedData = UpdateCategorySchema.parse(formData);
      const result = await updateCategory(
        currentCategory.id_categoria,
        validatedData
      );

      if (result.success) {
        toast.success("Categoría actualizada exitosamente");
        setIsEditModalOpen(false);
        setFormData({ categoria: "" });
        setCurrentCategory(null);
      } else {
        toast.error(result.error || "Error al actualizar categoría");
        setFormErrors({ submit: result.error });
      }
    } catch (error) {
      const validationError = getValidationError(error);
      toast.error(validationError);
      setFormErrors({ submit: validationError });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Cambiar Estado
  const handleToggleStatus = async () => {
    if (!currentCategory) return;
    setActionLoading(true);
    try {
      const result = await toggleCategoryStatus(
        currentCategory.id_categoria,
        currentCategory.id_estado_categoria
      );

      if (result.success) {
        toast.success(
          // Usamos el helper semántico para el mensaje
          isCategoryActive(currentCategory) // Si estaba activo antes del toggle...
            ? "Categoría desactivada exitosamente"
            : "Categoría activada exitosamente"
        );
        setIsStatusModalOpen(false);
        setCurrentCategory(null);
      } else {
        toast.error(result.error || "Error al cambiar estado de la categoría");
        setFormErrors({ submit: result.error });
      }
    } catch (error) {
      toast.error(error.message || "Error al cambiar estado de la categoría");
      setFormErrors({ submit: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  // --- HELPERS MODALES ---
  const openCreateModal = () => {
    setFormData({ categoria: "" });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setFormData({ categoria: category.categoria });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openStatusModal = (category) => {
    setCurrentCategory(category);
    setFormErrors({});
    setIsStatusModalOpen(true);
  };

  // --- CONFIGURACIÓN DE LA TABLA ---
  const tableColumns = [
    {
      header: "Nombre de la Categoría",
      accessorKey: "categoria", // ✅ Clave para ordenar
      sortable: true, // ✅ Activar ordenamiento
      className: "font-medium text-text-primary dark:text-background-light",
    },
    {
      header: "Productos Asociados",
      accessorKey: "numero_productos", // ✅ Clave para ordenar
      sortable: true, // ✅ Activar ordenamiento
      render: (row) => row.numero_productos || 0,
      className: "text-text-primary/90 dark:text-background-light/90",
    },
    {
      header: "Estado",
      render: (row) => {
        // ✨ Usamos isCategoryActive
        const isActive = isCategoryActive(row);
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isActive ? "Activa" : "Inactiva"}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => {
        const isActive = isCategoryActive(row);
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => openEditModal(row)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/30 transition-colors"
              title="Editar"
              disabled={actionLoading}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={() => openStatusModal(row)}
              className={`p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                  : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
              }`}
              title={isActive ? "Desactivar" : "Activar"}
              disabled={actionLoading}
            >
              <span className="material-symbols-outlined text-lg">
                {isActive ? "toggle_off" : "toggle_on"}
              </span>
            </button>
          </div>
        );
      },
    },
  ];

  // --- RENDERIZADO ---
  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Gestión de Categorías
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Administra las categorías de productos del sistema.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 min-w-[180px] justify-center"
          disabled={loading}
        >
          <span className="material-symbols-outlined">add</span>
          Crear Nueva Categoría
        </Button>
      </div>

      {/* Manejo de Error Inicial */}
      {initialLoadError && !loading && categories.length === 0 ? (
        <div className="text-center py-8 text-red-500">
          Error: {initialLoadError}
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {/* Barra de Búsqueda */}
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/60 dark:text-background-light/60">
                search
              </span>
              <input
                type="search"
                className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-primary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
                placeholder="Buscar categoría por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ✅ COMPONENTE DE TABLA REUTILIZABLE CON SORTING */}
          <Table
            columns={tableColumns}
            data={sortedCategories} // ✅ Usamos los datos ordenados
            isLoading={loading}
            keyField="id_categoria"
            sortConfig={sortConfig} // ✅ Pasamos config de orden
            onSort={handleSort} // ✅ Pasamos handler de orden
            emptyText={
              categories.length === 0
                ? "No hay categorías registradas."
                : "No hay categorías que coincidan con la búsqueda."
            }
          />
        </div>
      )}

      {/* --- MODALES --- */}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !actionLoading && setIsCreateModalOpen(false)}
        title="Crear Nueva Categoría"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary dark:text-background-light/90">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-primary/30 bg-white/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-primary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              placeholder="Ej: Chocolates Artesanales"
              value={formData.categoria}
              onChange={(e) => setFormData({ categoria: e.target.value })}
              required
              disabled={actionLoading}
            />
          </div>
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="inline-flex items-center gap-2"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Crear Categoría
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !actionLoading && setIsEditModalOpen(false)}
        title="Editar Categoría"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary dark:text-background-light/90">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-primary/30 bg-white/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-primary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              value={formData.categoria}
              onChange={(e) => setFormData({ categoria: e.target.value })}
              required
              disabled={actionLoading}
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="inline-flex items-center gap-2"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <CategoryStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => !actionLoading && setIsStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        category={currentCategory}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
};

export default CategoriesPage;
