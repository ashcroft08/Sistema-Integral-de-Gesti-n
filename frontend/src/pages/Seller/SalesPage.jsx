// src/pages/SalesPage.jsx - CON PERSISTENCIA DE DATOS
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSales } from "../../hooks/useSales";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../hooks/useProducts";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Table from "../../components/UI/Table";
import TablePagination from "../../components/UI/TablePagination";
import ClientSearchModal from "../../components/UI/ClientSearchModal";
import QuantityControl from "../../components/UI/QuantityControl";

const STORAGE_KEY = "salesPage_state";

const SalesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    products: allProducts,
    loading: productsLoading,
    error: productsError,
    refresh: loadInventoryData,
  } = useProducts();

  const {
    catalogs: { ivas, descuentos, metodosPago },
    loadCatalogs,
  } = useSales();

  // ✅ FUNCIÓN: Cargar estado guardado
  const loadSavedState = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
    }
    return null;
  };

  // ✅ FUNCIÓN: Guardar estado
  const saveState = (state) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  };

  // ✅ FUNCIÓN: Limpiar estado guardado
  const clearSavedState = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing saved state:", error);
    }
  };

  // --- ESTADOS CON CARGA INICIAL ---
  const savedState = loadSavedState();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [cart, setCart] = useState(savedState?.cart || []);
  const [selectedCliente, setSelectedCliente] = useState(
    savedState?.selectedCliente || null
  );
  const [selectedMetodoPago, setSelectedMetodoPago] = useState(
    savedState?.selectedMetodoPago || null
  );
  const [tipoVenta, setTipoVenta] = useState(
    savedState?.tipoVenta || "CONTADO"
  );
  const [plazoCreditoDias, setPlazoCreditoDias] = useState(
    savedState?.plazoCreditoDias || ""
  );
  const [referenciaPago, setReferenciaPago] = useState(
    savedState?.referenciaPago || ""
  );
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    loadInventoryData();
    loadCatalogs();
  }, [loadInventoryData, loadCatalogs]);

  // ✅ Verificar si venimos del checkout exitoso
  useEffect(() => {
    if (location.state?.fromCheckout && location.state?.success) {
      // Limpiar estado guardado después de una venta exitosa
      clearSavedState();
    }
  }, [location]);

  useEffect(() => {
    if (metodosPago?.length > 0 && !selectedMetodoPago) {
      const efectivo = metodosPago.find((m) => m.codigo === "EFECTIVO");
      const defaultMetodo = efectivo || metodosPago[0];
      setSelectedMetodoPago(defaultMetodo);
    }
  }, [metodosPago, selectedMetodoPago]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ✅ EFECTO: Guardar estado cuando cambie
  useEffect(() => {
    // Solo guardar si hay algo en el carrito o un cliente seleccionado
    if (cart.length > 0 || selectedCliente) {
      saveState({
        cart,
        selectedCliente,
        selectedMetodoPago,
        tipoVenta,
        plazoCreditoDias,
        referenciaPago,
      });
    }
  }, [
    cart,
    selectedCliente,
    selectedMetodoPago,
    tipoVenta,
    plazoCreditoDias,
    referenciaPago,
  ]);

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const availableProducts = allProducts.filter(
    (p) => p.stock_actual > 0 && !p.EstadoProducto?.codigo.includes("DES")
  );

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigo_producto &&
        p.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.CategoriaProducto?.categoria
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // COLUMNAS
  const productColumns = [
    {
      header: "Producto",
      accessorKey: "nombre",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary dark:text-background-light">
            {row.nombre}
          </p>
          <p className="text-xs text-text-secondary dark:text-background-light/70">
            {row.CategoriaProducto?.categoria}
          </p>
        </div>
      ),
    },
    {
      header: "Código",
      accessorKey: "codigo_producto",
      sortable: true,
      className: "text-sm font-mono",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300">
          {row.codigo_producto || "N/A"}
        </span>
      ),
    },
    {
      header: "Stock",
      accessorKey: "stock_actual",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.stock_actual < 5
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          }`}
        >
          {row.stock_actual} uds.
        </span>
      ),
    },
    {
      header: "Precio",
      accessorKey: "precio",
      sortable: true,
      className: "font-semibold",
      render: (row) => `$${parseFloat(row.precio).toFixed(2)}`,
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => handleAddToCart(row)}
          disabled={row.stock_actual <= 0}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            row.stock_actual <= 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/50"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            add_shopping_cart
          </span>
          Añadir
        </button>
      ),
    },
  ];

  const handleAddToCart = useCallback(
    (product) => {
      if (product.stock_actual <= 0) {
        toast.error(`El producto "${product.nombre}" está agotado.`);
        return;
      }
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (item) => item.id_producto === product.id_producto
        );
        let newCart = [...prevCart];
        if (existingItemIndex >= 0) {
          const existingItem = newCart[existingItemIndex];
          const newQuantity = existingItem.quantity + 1;
          if (newQuantity > product.stock_actual) {
            toast.error(
              `Stock insuficiente. Disponible: ${product.stock_actual}`
            );
            return prevCart;
          }
          newCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
        } else {
          const defaultIva = ivas.length > 0 ? ivas[0].id_iva : null;

          // ✅ NUEVO: Buscar descuento 0% por defecto
          const descuentoCero = descuentos.find(
            (d) => d.codigo === "DESC_0" || d.porcentaje_descuento === 0
          );

          newCart.push({
            ...product,
            quantity: 1,
            id_valor_iva: defaultIva,
            id_descuento: descuentoCero?.id_descuento || null, // ✅ Asignar descuento 0%
          });
        }
        return newCart;
      });
      toast.success(`"${product.nombre}" añadido al carrito`);
    },
    [ivas, descuentos] // ✅ Agregar descuentos como dependencia
  );

  const updateCartItemQuantity = useCallback(
    (id, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(id);
        return;
      }
      setCart((prevCart) => {
        return prevCart.map((item) => {
          if (item.id_producto === id) {
            const originalProduct = allProducts.find(
              (p) => p.id_producto === id
            );
            if (originalProduct && newQuantity > originalProduct.stock_actual) {
              toast.error(
                `Stock máximo alcanzado (${originalProduct.stock_actual})`
              );
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      });
    },
    [allProducts]
  );

  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id_producto !== id));
    toast.success("Producto eliminado del carrito");
  }, []);

  const updateCartItemIva = useCallback((id, newIvaId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id_producto === id ? { ...item, id_valor_iva: newIvaId } : item
      )
    );
  }, []);

  const updateCartItemDiscount = useCallback((id, newDiscountId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id_producto === id
          ? { ...item, id_descuento: newDiscountId }
          : item
      )
    );
  }, []);

  const calcularTotales = useCallback(() => {
    let subtotalSinIva = 0;
    let subtotalConIva = 0;
    let totalDescuento = 0;
    let totalIva = 0;
    let totalPagar = 0;

    cart.forEach((item) => {
      const precio = parseFloat(item.precio);
      const cantidad = item.quantity;
      const subtotalItem = precio * cantidad;

      const ivaObj = ivas.find((iva) => iva.id_iva === item.id_valor_iva);
      const porcentajeIva = ivaObj ? parseFloat(ivaObj.porcentaje_iva) : 0;

      let porcentajeDescuento = 0;
      if (item.id_descuento) {
        const descObj = descuentos.find(
          (d) => d.id_descuento === item.id_descuento && d.activo
        );
        if (descObj)
          porcentajeDescuento = parseFloat(descObj.porcentaje_descuento);
      }

      const descuentoItem = subtotalItem * (porcentajeDescuento / 100);
      const baseImponible = subtotalItem - descuentoItem;
      const valorIva = baseImponible * (porcentajeIva / 100);

      if (porcentajeIva > 0) {
        subtotalConIva += baseImponible;
        totalIva += valorIva;
      } else {
        subtotalSinIva += baseImponible;
      }

      totalDescuento += descuentoItem;
      totalPagar += baseImponible + valorIva;
    });

    const subtotal = subtotalSinIva + subtotalConIva;
    return {
      subtotal,
      subtotalSinIva,
      subtotalConIva,
      totalDescuento,
      totalIva,
      totalPagar,
    };
  }, [cart, ivas, descuentos]);

  const {
    subtotal,
    subtotalSinIva,
    subtotalConIva,
    totalDescuento,
    totalIva,
    totalPagar,
  } = calcularTotales();

  const handleContinuarAlPago = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    if (!selectedCliente) {
      toast.error("Seleccione un cliente");
      return;
    }
    if (!selectedMetodoPago) {
      toast.error("Seleccione un método de pago");
      return;
    }

    // ✅ NUEVA VALIDACIÓN: Verificar que todos los productos tengan IVA
    const productsSinIva = cart.filter((item) => !item.id_valor_iva);
    if (productsSinIva.length > 0) {
      const nombres = productsSinIva.map((p) => p.nombre).join(", ");
      toast.error(
        `Los siguientes productos no tienen IVA seleccionado: ${nombres}`
      );
      return;
    }

    if (
      tipoVenta === "CREDITO" &&
      (!plazoCreditoDias || plazoCreditoDias <= 0)
    ) {
      toast.error("Para ventas a crédito, debe especificar el plazo en días");
      return;
    }

    // Navegar al checkout con los datos
    navigate("/seller/checkout", {
      state: {
        cart,
        selectedCliente,
        selectedMetodoPago,
        tipoVenta,
        plazoCreditoDias,
        referenciaPago,
        totales: {
          subtotal,
          subtotalSinIva,
          subtotalConIva,
          totalDescuento,
          totalIva,
          totalPagar,
        },
      },
    });
  };

  // ✅ NUEVA FUNCIÓN: Limpiar carrito completamente
  const handleLimpiarCarrito = () => {
    setCart([]);
    setSelectedCliente(null);
    setSelectedMetodoPago(
      metodosPago.find((m) => m.codigo === "EFECTIVO") || metodosPago[0]
    );
    setTipoVenta("CONTADO");
    setPlazoCreditoDias("");
    setReferenciaPago("");
    clearSavedState();
    toast.success("Carrito limpiado");
  };

  if (productsLoading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (productsError) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-red-500">
          Error: {productsError}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Punto de Venta
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Registra nuevas ventas y genera facturas electrónicas
          </p>
        </div>

        {/* ✅ BOTÓN: Limpiar carrito */}
        {(cart.length > 0 || selectedCliente) && (
          <button
            onClick={handleLimpiarCarrito}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Limpiar Todo
          </button>
        )}
      </div>

      {/* LAYOUT GRID - 60/40 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* PANEL IZQUIERDO - CATÁLOGO (60%) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Buscador: CORREGIDO (cambiado flex-grow por w-full) */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              search
            </span>
            <input
              type="search"
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
            <Table
              columns={productColumns}
              data={currentProducts}
              isLoading={productsLoading}
              keyField="id_producto"
              emptyText="No hay productos disponibles."
            />
          </div>

          {/* Paginación */}
          <div className="mt-1">
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

        {/* PANEL DERECHO - CARRITO (40%) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Selección de Cliente */}
          <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-text-primary dark:text-background-light mb-3">
              Cliente
            </h3>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary">
                  person
                </span>
                <span className="text-sm text-text-primary dark:text-background-light">
                  {selectedCliente
                    ? `${selectedCliente.nombre} ${selectedCliente.apellido}`
                    : "Seleccionar cliente"}
                </span>
              </div>
              <span className="material-symbols-outlined text-text-secondary">
                chevron_right
              </span>
            </button>
          </div>

          {/* Método de Pago y Tipo de Venta */}
          <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-text-primary dark:text-background-light mb-3">
              Método de Pago
            </h3>
            <select
              value={selectedMetodoPago?.id_metodo_pago || ""}
              onChange={(e) => {
                const metodo = metodosPago.find(
                  (m) => m.id_metodo_pago === parseInt(e.target.value)
                );
                setSelectedMetodoPago(metodo);
              }}
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 px-3 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light mb-3"
            >
              {metodosPago?.map((metodo) => (
                <option
                  key={metodo.id_metodo_pago}
                  value={metodo.id_metodo_pago}
                >
                  {metodo.metodo_pago}
                </option>
              ))}
            </select>

            {/* Tipo de Venta */}
            <h3 className="text-sm font-semibold text-text-primary dark:text-background-light mb-3 mt-4">
              Tipo de Venta
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setTipoVenta("CONTADO");
                  setPlazoCreditoDias("");
                }}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  tipoVenta === "CONTADO"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Contado
              </button>
              <button
                onClick={() => setTipoVenta("CREDITO")}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  tipoVenta === "CREDITO"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Crédito
              </button>
            </div>

            {/* Plazo de Crédito */}
            {tipoVenta === "CREDITO" && (
              <div className="mb-3">
                <label className="block text-xs text-text-secondary dark:text-background-light/70 mb-1">
                  Plazo en días *
                </label>
                <input
                  type="number"
                  value={plazoCreditoDias}
                  onChange={(e) => setPlazoCreditoDias(e.target.value)}
                  placeholder="Ej: 30"
                  min="1"
                  className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 px-3 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light"
                />
              </div>
            )}

            {/* Referencia de Pago */}
            <div>
              <label className="block text-xs text-text-secondary dark:text-background-light/70 mb-1">
                Referencia de pago (opcional)
              </label>
              <input
                type="text"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                placeholder="Ej: Voucher #12345"
                maxLength={50}
                className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 px-3 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light"
              />
            </div>
          </div>

          {/* Carrito de Compras */}
          <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary dark:text-background-light">
                  Carrito
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {cart.length} items
                </span>
              </div>
            </div>

            {/* Items del Carrito */}
            <div className="flex-1 overflow-y-auto max-h-96 p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-text-secondary/60">
                  <span className="material-symbols-outlined text-4xl mb-2">
                    shopping_cart
                  </span>
                  <p className="text-sm">Carrito vacío</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id_producto}
                    className="relative border border-primary/10 rounded-lg p-3 hover:border-primary/30 transition-colors"
                  >
                    <button
                      onClick={() => removeFromCart(item.id_producto)}
                      className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-full p-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>

                    <div className="mb-2">
                      <p className="text-sm font-medium text-text-primary dark:text-background-light">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-primary font-semibold">
                        ${(item.precio * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center gap-2">
                      {/* Cantidad */}
                      <QuantityControl
                        quantity={item.quantity}
                        onChange={(newVal) =>
                          updateCartItemQuantity(item.id_producto, newVal)
                        }
                        max={item.stock_actual} // Optional: pass max stock if you want to disable + button at limit
                      />

                      {/* IVA */}
                      <select
                        value={item.id_valor_iva || ""}
                        onChange={(e) =>
                          updateCartItemIva(
                            item.id_producto,
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1 text-xs border border-primary/20 rounded-lg py-1 px-2 focus:ring-1 focus:ring-primary"
                      >
                        {ivas.map((iva) => (
                          <option key={iva.id_iva} value={iva.id_iva}>
                            IVA {iva.porcentaje_iva}%
                          </option>
                        ))}
                      </select>

                      {/* Descuento */}
                      <select
                        value={item.id_descuento || ""}
                        onChange={(e) => {
                          const descuentoId = e.target.value
                            ? parseInt(e.target.value)
                            : null;

                          // ✅ Si no selecciona nada, asignar descuento 0%
                          if (!descuentoId) {
                            const descuentoCero = descuentos.find(
                              (d) =>
                                d.codigo === "DESC_0" ||
                                d.porcentaje_descuento === 0
                            );
                            updateCartItemDiscount(
                              item.id_producto,
                              descuentoCero?.id_descuento || null
                            );
                          } else {
                            updateCartItemDiscount(
                              item.id_producto,
                              descuentoId
                            );
                          }
                        }}
                        className="flex-1 text-xs border border-primary/20 rounded-lg py-1 px-2 focus:ring-1 focus:ring-primary"
                      >
                        {/* ✅ Mostrar opción "Sin Descuento" pero asignar el 0% */}
                        {descuentos
                          .filter((d) => d.activo)
                          .map((desc) => (
                            <option
                              key={desc.id_descuento}
                              value={desc.id_descuento}
                            >
                              {desc.porcentaje_descuento === 0
                                ? "Sin Descuento"
                                : `${desc.porcentaje_descuento}% - ${desc.descuento}`}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totales y Botón */}
            <div className="p-4 border-t border-primary/10 bg-gray-50/50 dark:bg-background-dark/20">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-text-secondary dark:text-background-light/70">
                  <span>Subtotal (0% IVA)</span>
                  <span>${subtotalSinIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary dark:text-background-light/70">
                  <span>Subtotal (con IVA)</span>
                  <span>${subtotalConIva.toFixed(2)}</span>
                </div>
                {totalIva > 0 && (
                  <div className="flex justify-between text-text-secondary dark:text-background-light/70">
                    <span>IVA</span>
                    <span>${totalIva.toFixed(2)}</span>
                  </div>
                )}
                {totalDescuento > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento</span>
                    <span>-${totalDescuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-primary/20 pt-2">
                  <span>Total</span>
                  <span className="text-primary">${totalPagar.toFixed(2)}</span>
                </div>

                {tipoVenta === "CREDITO" && plazoCreditoDias > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-400">
                      <strong>Venta a crédito:</strong> {plazoCreditoDias} días
                      de plazo
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleContinuarAlPago}
                disabled={cart.length === 0 || !selectedCliente}
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">receipt_long</span>
                {tipoVenta === "CREDITO"
                  ? "Continuar a Crédito"
                  : "Continuar al Pago"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ClientSearchModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={(cliente) => {
          setSelectedCliente(cliente);
          setIsClientModalOpen(false);
        }}
      />
    </AdminLayout>
  );
};

export default SalesPage;
