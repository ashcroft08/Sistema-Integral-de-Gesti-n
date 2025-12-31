// src/pages/Admin/InventoryPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../hooks/useProducts";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/ui/Button";
import Table from "../../components/UI/Table";
import TablePagination from "../../components/UI/TablePagination";
import { toast } from "react-toastify";
import { ESTADOS_PRODUCTO } from "../../constants/statuses";

// Modales
import ProductFormModal from "../../components/ui/ProductFormModal";
import ProductStatusConfirmationModal from "../../components/UI/ProductStatusConfirmationModal";
import RestockModal from "../../components/ui/RestockModal";
import KardexModal from "../../components/ui/KardexModal";

const InventoryPage = () => {
  const { user } = useAuth();
  const {
    products,
    categories,
    loading,
    error,
    createProduct,
    updateProduct,
    discontinueProduct,
    reactivateProduct,
    addStock, // ✨ Traemos la nueva función del hook
  } = useProducts();

  // --- ESTADOS DE FILTRO Y UI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- ESTADOS DE MODALES ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDiscontinueModalOpen, setIsDiscontinueModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false); // ✨ Estado modal restock
  const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDiscontinue, setProductToDiscontinue] = useState(null);
  const [productToRestock, setProductToRestock] = useState(null); // ✨ Producto a reabastecer
  const [initialLoadError, setInitialLoadError] = useState(null);

  // --- 🧠 HELPERS DE LÓGICA ---
  const isDiscontinued = (p) =>
    p?.EstadoProducto?.codigo === ESTADOS_PRODUCTO.DESCONTINUADO;
  const isOutOfStock = (p) => !isDiscontinued(p) && p.stock_actual === 0;
  const isLowStock = (p) =>
    p.stock_actual <= p.stock_minimo && p.stock_actual > 0;
  const isActiveAndAvailable = (p) => !isDiscontinued(p) && p.stock_actual > 0;

  // --- EFECTOS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  // --- ERROR HANDLING ---
  useEffect(() => {
    if (error && !loading && products.length === 0) {
      setInitialLoadError(error);
    } else {
      setInitialLoadError(null);
    }
  }, [error, loading, products.length]);

  if (initialLoadError && !loading && products.length === 0) {
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

  // --- FILTRADO (SIN useMemo) ---
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    // Modificado: Buscar también por codigo_producto
    const matchesSearch =
      product.nombre.toLowerCase().includes(term) ||
      product.CategoriaProducto?.categoria.toLowerCase().includes(term) ||
      (product.codigo_producto &&
        product.codigo_producto.toLowerCase().includes(term));

    const matchesCategory =
      categoryFilter === "all" ||
      product.id_categoria === Number(categoryFilter);

    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = isActiveAndAvailable(product);
    } else if (statusFilter === "out_of_stock") {
      matchesStatus = isOutOfStock(product);
    } else if (statusFilter === "discontinued") {
      matchesStatus = isDiscontinued(product);
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // --- ORDENAMIENTO (SIN useMemo) ---
  const sortedProducts = [...filteredProducts];
  if (sortConfig.key) {
    sortedProducts.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "categoria") {
        aVal = a.CategoriaProducto?.categoria || "";
        bVal = b.CategoriaProducto?.categoria || "";
      }
      // Añadido para ordenar por código de producto
      if (sortConfig.key === "codigo_producto") {
        aVal = a.codigo_producto || "";
        bVal = b.codigo_producto || "";
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  // --- PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- HANDLERS ACCIONES GENERALES ---
  const handleOpenCreate = () => {
    setCurrentProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    if (isDiscontinued(product)) {
      toast.warning("Reactiva el producto para poder editarlo.");
      return;
    }
    setCurrentProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenKardex = (product) => {
    setCurrentProduct(product);
    setIsKardexModalOpen(true);
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

  // --- HANDLERS REABASTECER (✨ NUEVO) ---
  const handleOpenRestock = (product) => {
    setProductToRestock(product);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = async (id, cantidad) => {
    const result = await addStock(id, cantidad);

    if (result.success) {
      toast.success(
        `Stock actualizado. Nuevo total: ${result.data.producto.stock_actual}`
      );
    } else {
      toast.error(result.error || "Error al agregar stock");
    }
    // El modal se cierra solo desde dentro del componente RestockModal al llamar a onClose,
    // pero si usas la lógica manual aquí, asegúrate de cerrarlo o dejar que el componente lo haga.
    // Nota: El componente RestockModal que te di antes ya maneja el cierre.
  };

  // --- HANDLERS DESCONTINUAR ---
  const handleOpenDiscontinueModal = (product) => {
    setProductToDiscontinue(product);
    setIsDiscontinueModalOpen(true);
  };

  const handleConfirmDiscontinue = async () => {
    if (!productToDiscontinue) return;

    const isDisc = isDiscontinued(productToDiscontinue);
    let result;

    if (isDisc) {
      result = await reactivateProduct(productToDiscontinue.id_producto);
      if (result.success)
        toast.success(`Producto "${productToDiscontinue.nombre}" reactivado`);
    } else {
      result = await discontinueProduct(productToDiscontinue.id_producto);
      if (result.success)
        toast.success(
          `Producto "${productToDiscontinue.nombre}" descontinuado`
        );
    }

    if (!result.success) toast.error(result.error);

    setIsDiscontinueModalOpen(false);
    setProductToDiscontinue(null);
  };

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns = [
    {
      header: "Producto",
      accessorKey: "nombre",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
      render: (row) => (
        <div className="flex flex-col">
          <span
            className={
              isDiscontinued(row) ? "opacity-50 line-through text-gray-500" : ""
            }
          >
            {row.nombre}
          </span>
          {isDiscontinued(row) && (
            <span className="text-[10px] uppercase font-bold text-gray-400">
              Descontinuado
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Código de Barras",
      accessorKey: "codigo_producto", // Usar el nombre del campo en el objeto producto
      sortable: true,
      // Aplicado el mismo className que Categoría
      className: "text-text-secondary dark:text-background-light/80 font-mono",
      render: (row) =>
        row.codigo_producto || (
          <span className="italic text-gray-400">N/A</span>
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
      header: "Stock Inicial",
      accessorKey: "stock_inicial",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-gray-600 dark:text-gray-400">
            {row.stock_inicial} uds
          </span>
        </div>
      ),
    },
    {
      header: "Stock Actual",
      accessorKey: "stock_actual",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-mono ${
              isLowStock(row) ? "text-red-600 font-bold" : ""
            }`}
          >
            {row.stock_actual} uds
          </span>
          {isLowStock(row) && !isDiscontinued(row) && (
            <span
              className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
              title="Stock Bajo"
            ></span>
          )}
        </div>
      ),
    },
    {
      header: "Estado",
      render: (row) => {
        if (isDiscontinued(row)) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              Descontinuado
            </span>
          );
        }
        if (isOutOfStock(row)) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
              Agotado
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            Disponible
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => {
        const isDisc = isDiscontinued(row);
        const isAdmin =
          user?.rol === "Administrador" || user?.rol === "Superusuario";

        return (
          <div className="inline-flex items-center justify-end gap-2">
            {/* ✨ BOTÓN DE REABASTECER (NUEVO) */}
            <button
              onClick={() => handleOpenRestock(row)}
              disabled={isDisc}
              className={`p-2 text-text-secondary/80 hover:text-indigo-600 dark:text-background-light/70 dark:hover:text-indigo-400 rounded-lg transition-colors ${
                isDisc ? "cursor-not-allowed opacity-50" : ""
              }`}
              title="Agregar Stock (Compra)"
            >
              <span className="material-symbols-outlined text-lg">
                add_shopping_cart
              </span>
            </button>

            {/* Botón Editar */}
            <button
              onClick={() => handleOpenEdit(row)}
              disabled={isDisc}
              className={`p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors ${
                isDisc ? "cursor-not-allowed opacity-50" : ""
              }`}
              title="Editar"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>

            {/* Botón Descontinuar/Reactivar */}
            {isAdmin && (
              <button
                onClick={() => handleOpenDiscontinueModal(row)}
                className={`p-2 text-text-secondary/80 rounded-lg transition-colors ${
                  isDisc
                    ? "hover:text-green-600 dark:hover:text-green-400"
                    : "hover:text-gray-500 dark:hover:text-gray-400"
                }`}
                title={isDisc ? "Reactivar" : "Descontinuar"}
              >
                <span className="material-symbols-outlined text-lg">
                  {isDisc ? "restore_from_trash" : "archive"}
                </span>
              </button>
            )}

            {/* Botón historial movimientos (Kardex) */}
            <button
              onClick={() => handleOpenKardex(row)}
              disabled={isDisc}
              className={`p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors ${
                isDisc ? "cursor-not-allowed opacity-50" : ""
              }`}
              title="Historial de Movimientos (Kardex)"
            >
              <span className="material-symbols-outlined text-lg">overview</span>
            </button>
          </div>
        );
      },
    },
  ];

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Inventario
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Gestión general de productos y existencias.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-6 py-3 min-w-[180px] justify-center"
          disabled={loading}
        >
          <span className="material-symbols-outlined">add</span>
          {loading ? "Cargando..." : "Nuevo Producto"}
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

          {/* Filtro Categoría */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
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
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="active">🟢 Disponibles</option>
              <option value="out_of_stock">🟠 Agotados</option>
              <option value="discontinued">⚪ Descontinuados</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={currentProducts}
            isLoading={loading}
            keyField="id_producto"
            sortConfig={sortConfig}
            onSort={handleSort}
            emptyText="No se encontraron productos con los filtros actuales."
          />
        </div>

        {/* PAGINACIÓN */}
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

      {/* MODALES */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
        product={currentProduct}
        categories={categories}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onConfirm={handleConfirmRestock}
        product={productToRestock}
      />

      <KardexModal
        isOpen={isKardexModalOpen}
        onClose={() => setIsKardexModalOpen(false)}
        product={currentProduct} // Usamos currentProduct que seteaste en handleOpenKardex
      />

      <ProductStatusConfirmationModal
        isOpen={isDiscontinueModalOpen}
        onClose={() => setIsDiscontinueModalOpen(false)}
        onConfirm={handleConfirmDiscontinue}
        title={
          isDiscontinued(productToDiscontinue)
            ? "Reactivar Producto"
            : "Descontinuar Producto"
        }
        message={
          isDiscontinued(productToDiscontinue)
            ? `¿Deseas reactivar "${productToDiscontinue?.nombre}"? Volverá a estar disponible para la venta.`
            : `¿Estás seguro de descontinuar "${productToDiscontinue?.nombre}"? Se ocultará del catálogo y no se podrá vender.`
        }
        confirmText={
          isDiscontinued(productToDiscontinue) ? "Reactivar" : "Descontinuar"
        }
        isDanger={!isDiscontinued(productToDiscontinue)}
      />
    </AdminLayout>
  );
};

export default InventoryPage;
