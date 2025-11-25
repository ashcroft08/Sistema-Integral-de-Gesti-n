import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../hooks/useProducts";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Table from "../../components/UI/Table";
import { toast } from "react-toastify";
import { ESTADOS_PRODUCTO } from "../../constants/statuses";

// Importa tus modales
import ProductFormModal from "../../components/UI/ProductFormModal";
import ProductStatusConfirmationModal from "../../components/UI/ProductStatusConfirmationModal";

const InventoryPage = () => {
  const { user } = useAuth();
  const {
    products,
    categories,
    statuses,
    loading,
    error,
    createProduct,
    updateProduct,
    changeProductStatus,
    discontinueProduct,
    reactivateProduct,
  } = useProducts();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- MODALES ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDiscontinueModalOpen, setIsDiscontinueModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToChangeStatus, setProductToChangeStatus] = useState(null);
  const [productToDiscontinue, setProductToDiscontinue] = useState(null);

  // --- HELPERS VISUALES ---
  const isProductActive = (p) =>
    p?.EstadoProducto?.codigo === ESTADOS_PRODUCTO.ACTIVO;
  const isProductLowStock = (p) => p.stock_actual <= p.stock_minimo;
  const isProductDiscontinued = (p) =>
    p?.EstadoProducto?.codigo === ESTADOS_PRODUCTO.DESCONTINUADO;

  // --- LÓGICA DE FILTRADO ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        product.nombre.toLowerCase().includes(term) ||
        product.CategoriaProducto?.categoria.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "all" ||
        product.id_categoria === Number(categoryFilter);

      const matchesStatus =
        statusFilter === "all" ||
        product.EstadoProducto?.codigo === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // --- LÓGICA DE ORDENAMIENTO ---
  const sortedProducts = useMemo(() => {
    let items = [...filteredProducts];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "categoria") {
          aVal = a.CategoriaProducto?.categoria || "";
          bVal = b.CategoriaProducto?.categoria || "";
        }

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredProducts, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  // --- HANDLERS (CRUD) ---
  const handleOpenCreate = () => {
    setCurrentProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    // Validar que no esté descontinuado
    if (isProductDiscontinued(product)) {
      toast.warning(
        "No se pueden editar productos descontinuados. Primero reactívalo."
      );
      return;
    }
    setCurrentProduct(product);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    let result;
    if (currentProduct) {
      result = await updateProduct(currentProduct.id_producto, formData);
      if (result.success) toast.success("Producto actualizado correctamente");
    } else {
      result = await createProduct(formData);
      if (result.success) toast.success("Producto creado correctamente");
    }

    if (!result.success) {
      toast.error(result.error || "Error al guardar");
      return { success: false, error: result.error };
    }

    setIsFormModalOpen(false);
    return { success: true };
  };

  // --- HANDLERS (ESTADO ACTIVO/INACTIVO) ---
  const handleOpenStatusModal = (product) => {
    setProductToChangeStatus(product);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!productToChangeStatus) return;

    const currentCode = productToChangeStatus.EstadoProducto?.codigo;

    // Validación temprana de stock
    if (
      currentCode !== ESTADOS_PRODUCTO.ACTIVO &&
      productToChangeStatus.stock_actual <= 0
    ) {
      toast.warning(
        "No puedes activar un producto con Stock 0. Agrega inventario primero."
      );
      setIsStatusModalOpen(false);
      setProductToChangeStatus(null);
      return;
    }

    // Determinar estado destino
    const targetCode =
      currentCode === ESTADOS_PRODUCTO.ACTIVO
        ? ESTADOS_PRODUCTO.INACTIVO
        : ESTADOS_PRODUCTO.ACTIVO;

    const targetStatus = statuses.find((s) => s.codigo === targetCode);

    if (!targetStatus) {
      toast.error(
        "Error: Estados del sistema no disponibles. Recarga la página."
      );
      return;
    }

    const result = await changeProductStatus(
      productToChangeStatus.id_producto,
      targetStatus.id_estado_producto
    );

    if (result.success) {
      toast.success(
        `Producto ${
          targetCode === ESTADOS_PRODUCTO.ACTIVO ? "activado" : "desactivado"
        } correctamente`
      );
      setIsStatusModalOpen(false);
      setProductToChangeStatus(null);
    } else {
      toast.error(result.error || "Error al cambiar el estado");
    }
  };

  // --- HANDLERS (DESCONTINUAR/REACTIVAR) ---
  const handleOpenDiscontinueModal = (product) => {
    setProductToDiscontinue(product);
    setIsDiscontinueModalOpen(true);
  };

  const handleConfirmDiscontinue = async () => {
    if (!productToDiscontinue) return;

    const isCurrentlyDiscontinued = isProductDiscontinued(productToDiscontinue);

    let result;
    if (isCurrentlyDiscontinued) {
      // Reactivar
      result = await reactivateProduct(productToDiscontinue.id_producto);
      if (result.success) {
        toast.success(
          `Producto "${productToDiscontinue.nombre}" reactivado correctamente`
        );
      }
    } else {
      // Descontinuar
      result = await discontinueProduct(productToDiscontinue.id_producto);
      if (result.success) {
        toast.success(
          `Producto "${productToDiscontinue.nombre}" marcado como descontinuado`
        );
      }
    }

    if (!result.success) {
      toast.error(result.error || "Error al cambiar el estado");
    }

    setIsDiscontinueModalOpen(false);
    setProductToDiscontinue(null);
  };

  // --- RENDERERS ---
  const getStatusBadge = (codigo, nombre) => {
    const styles = {
      [ESTADOS_PRODUCTO.ACTIVO]:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      [ESTADOS_PRODUCTO.INACTIVO]:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      [ESTADOS_PRODUCTO.AGOTADO]:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      [ESTADOS_PRODUCTO.DESCONTINUADO]:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[codigo] || "bg-gray-100"
        }`}
      >
        {nombre || "Desconocido"}
      </span>
    );
  };

  const columns = [
    {
      header: "Producto",
      accessorKey: "nombre",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
      render: (row) => (
        <div className="flex flex-col">
          <span className={isProductDiscontinued(row) ? "opacity-60" : ""}>
            {row.nombre}
          </span>
          {isProductDiscontinued(row) && (
            <span className="text-xs text-gray-500 italic">Descontinuado</span>
          )}
        </div>
      ),
    },
    {
      header: "Categoría",
      accessorKey: "categoria",
      sortable: true,
      className: "text-text-secondary dark:text-background-light/80",
      render: (row) =>
        row.CategoriaProducto?.categoria || (
          <span className="italic text-gray-400">Sin Categoría</span>
        ),
    },
    {
      header: "Precio",
      accessorKey: "precio",
      sortable: true,
      className: "font-semibold text-text-primary dark:text-background-light",
      render: (row) => `$${parseFloat(row.precio).toFixed(2)}`,
    },
    {
      header: "Stock",
      accessorKey: "stock_actual",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-mono ${
              isProductLowStock(row) ? "text-red-600 font-bold" : ""
            }`}
          >
            {row.stock_actual}
          </span>
          {isProductLowStock(row) && !isProductDiscontinued(row) && (
            <span
              className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
              title={`Stock Bajo (Mín: ${row.stock_minimo})`}
            ></span>
          )}
        </div>
      ),
    },
    {
      header: "Estado",
      render: (row) =>
        getStatusBadge(
          row.EstadoProducto?.codigo,
          row.EstadoProducto?.estado_producto
        ),
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => {
        const isDiscontinued = isProductDiscontinued(row);
        const isActive = isProductActive(row);
        const isAdmin =
          user?.rol === "Administrador" ||
          user?.rol === "Superusuario";

        return (
          <div className="flex items-center justify-end gap-2">
            {/* Botón Editar */}
            <button
              onClick={() => handleOpenEdit(row)}
              disabled={isDiscontinued}
              className={`p-1.5 rounded-lg transition-colors ${
                isDiscontinued
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400"
              }`}
              title={
                isDiscontinued
                  ? "No se puede editar un producto descontinuado"
                  : "Editar Producto"
              }
            >
              <span className="material-symbols-outlined text-xl">
                edit_square
              </span>
            </button>

            {/* Botón Activar/Desactivar - Oculto si está descontinuado */}
            {!isDiscontinued && (
              <button
                onClick={() => handleOpenStatusModal(row)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
                    : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:text-green-400"
                }`}
                title={isActive ? "Desactivar" : "Activar"}
              >
                <span className="material-symbols-outlined text-xl">
                  {isActive ? "block" : "check_circle"}
                </span>
              </button>
            )}

            {/* Botón Descontinuar/Reactivar - Solo para Admins */}
            {isAdmin && (
              <button
                onClick={() => handleOpenDiscontinueModal(row)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDiscontinued
                    ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400"
                    : "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 dark:text-yellow-400"
                }`}
                title={
                  isDiscontinued
                    ? "Reactivar Producto"
                    : "Descontinuar Producto"
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {isDiscontinued ? "restart_alt" : "cancel"}
                </span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary dark:text-background-light">
            Inventario
          </h1>
          <p className="text-text-secondary dark:text-background-light/60 mt-1">
            Gestión general de productos y existencias.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap shrink-0 px-4"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 p-4 bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm">
        {/* Buscador */}
        <div className="md:col-span-5 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="search"
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro Categoría */}
        <div className="md:col-span-4 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            category
          </span>
          <select
            className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Estado */}
        <div className="md:col-span-3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            filter_list
          </span>
          <select
            className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value={ESTADOS_PRODUCTO.ACTIVO}>Activos</option>
            <option value={ESTADOS_PRODUCTO.INACTIVO}>Inactivos</option>
            <option value={ESTADOS_PRODUCTO.AGOTADO}>Agotados</option>
            <option value={ESTADOS_PRODUCTO.DESCONTINUADO}>
              Descontinuados
            </option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          data={sortedProducts}
          isLoading={loading}
          keyField="id_producto"
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyText={
            <span className="flex flex-col items-center justify-center py-10 text-gray-500 block">
              <span className="material-symbols-outlined text-4xl mb-2 block">
                inventory_2
              </span>
              <span className="block">
                No se encontraron productos con los filtros actuales.
              </span>
            </span>
          }
        />
      </div>

      {/* Modal: Crear/Editar Producto */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
        product={currentProduct}
        categories={categories}
      />

      {/* Modal: Activar/Desactivar Producto */}
      <ProductStatusConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setProductToChangeStatus(null);
        }}
        onConfirm={handleConfirmStatusChange}
        title={
          productToChangeStatus?.EstadoProducto?.codigo ===
          ESTADOS_PRODUCTO.ACTIVO
            ? "Desactivar Producto"
            : "Activar Producto"
        }
        message={
          productToChangeStatus
            ? `¿Estás seguro que deseas ${
                productToChangeStatus.EstadoProducto?.codigo ===
                ESTADOS_PRODUCTO.ACTIVO
                  ? "desactivar"
                  : "activar"
              } el producto "${productToChangeStatus.nombre}"?`
            : ""
        }
        confirmText={
          productToChangeStatus?.EstadoProducto?.codigo ===
          ESTADOS_PRODUCTO.ACTIVO
            ? "Desactivar"
            : "Activar"
        }
        isDanger={
          productToChangeStatus?.EstadoProducto?.codigo ===
          ESTADOS_PRODUCTO.ACTIVO
        }
      />

      {/* Modal: Descontinuar/Reactivar Producto */}
      <ProductStatusConfirmationModal
        isOpen={isDiscontinueModalOpen}
        onClose={() => {
          setIsDiscontinueModalOpen(false);
          setProductToDiscontinue(null);
        }}
        onConfirm={handleConfirmDiscontinue}
        title={
          isProductDiscontinued(productToDiscontinue)
            ? "Reactivar Producto Descontinuado"
            : "Descontinuar Producto"
        }
        message={
          productToDiscontinue ? (
            isProductDiscontinued(productToDiscontinue) ? (
              <div className="space-y-3">
                <p>
                  ¿Deseas reactivar el producto{" "}
                  <strong>"{productToDiscontinue.nombre}"</strong>?
                </p>
                <div className="text-sm text-left bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                    ℹ️ Información:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                    <li>El producto volverá a estar disponible para ventas</li>
                    <li>
                      Se activará automáticamente si tiene stock, o quedará como
                      "Agotado" si stock = 0
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p>
                  ¿Estás seguro que deseas <strong>descontinuar</strong> el
                  producto <strong>"{productToDiscontinue.nombre}"</strong>?
                </p>
                <div className="text-sm text-left bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                    ⚠️ Consecuencias:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-300">
                    <li>El producto NO aparecerá en el catálogo de ventas</li>
                    <li>No se podrá editar hasta que sea reactivado</li>
                    <li>Se mantendrá en el historial de ventas pasadas</li>
                    <li>Solo administradores pueden reactivarlo</li>
                  </ul>
                </div>
              </div>
            )
          ) : (
            ""
          )
        }
        confirmText={
          isProductDiscontinued(productToDiscontinue)
            ? "Sí, Reactivar"
            : "Sí, Descontinuar"
        }
        isDanger={!isProductDiscontinued(productToDiscontinue)}
      />
    </AdminLayout>
  );
};

export default InventoryPage;
