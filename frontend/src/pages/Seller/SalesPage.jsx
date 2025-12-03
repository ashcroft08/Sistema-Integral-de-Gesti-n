// src/pages/SalesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSales } from "../../hooks/useSales"; // Importamos el nuevo hook
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../hooks/useProducts"; // Usamos el hook existente para productos
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Table from "../../components/UI/Table";

const SalesPage = () => {
  const { user } = useAuth();
  // Cambio aquí: extraer 'refresh' en lugar de 'loadInventoryData'
  const {
    products: allProducts,
    loading: productsLoading,
    error: productsError,
    refresh: loadInventoryData,
  } = useProducts();
  const {
    catalogs: { ivas, descuentos },
    loadCatalogs,
    createSale: createSaleService,
  } = useSales(); // Usamos el hook
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null); // Estado para el cliente seleccionado
  const [loadingSale, setLoadingSale] = useState(false); // Estado para el botón de venta

  // Cargar productos y catálogos al montar el componente
  useEffect(() => {
    // Ahora loadInventoryData está disponible gracias al alias 'refresh'
    loadInventoryData();
    loadCatalogs(); // Usamos la función del hook
  }, [loadInventoryData, loadCatalogs]); // Asegúrate de incluir loadInventoryData en las dependencias

  // ... (resto del código de SalesPage.jsx permanece igual)
  // Filtrar productos disponibles (no descontinuados y stock > 0)
  const availableProducts = allProducts.filter(
    (p) => p.stock_actual > 0 && !p.EstadoProducto?.codigo.includes("DES")
  );

  // Filtrar productos según el término de búsqueda
  const filteredProducts = availableProducts.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigo_producto &&
        p.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.CategoriaProducto?.categoria
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Columnas para la tabla de productos
  const productColumns = [
    {
      header: "Producto",
      accessorKey: "nombre",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
    },
    {
      header: "Código de Barras",
      accessorKey: "codigo_producto",
      sortable: true,
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
      header: "Stock",
      accessorKey: "stock_actual",
      sortable: true,
      className: "text-text-secondary dark:text-background-light/80",
      render: (row) =>
        row.stock_actual > 0 ? (
          `${row.stock_actual} uds.`
        ) : (
          <span className="font-medium text-red-600 dark:text-red-400">
            Agotado
          </span>
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
      header: "Acción",
      className: "text-center",
      render: (row) => (
        <button
          onClick={() => handleAddToCart(row)}
          disabled={row.stock_actual <= 0}
          className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            row.stock_actual <= 0
              ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          }`}
        >
          <span className="material-symbols-outlined !text-base">
            add_shopping_cart
          </span>{" "}
          Añadir
        </button>
      ),
    },
  ];

  // Función para añadir producto al carrito
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
          // Si el producto ya está en el carrito, aumentamos la cantidad
          const existingItem = newCart[existingItemIndex];
          const newQuantity = existingItem.quantity + 1;
          // Validar que no se exceda el stock disponible
          if (newQuantity > product.stock_actual) {
            toast.error(
              `No hay suficiente stock para "${product.nombre}". Stock disponible: ${product.stock_actual}`
            );
            return prevCart; // No actualizamos el carrito
          }
          newCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
        } else {
          // Si no está, lo añadimos con cantidad 1 y valores por defecto
          if (1 > product.stock_actual) {
            toast.error(
              `No hay suficiente stock para "${product.nombre}". Stock disponible: ${product.stock_actual}`
            );
            return prevCart; // No actualizamos el carrito
          }
          // Asumimos un IVA por defecto (por ejemplo, el primero)
          const defaultIva = ivas.length > 0 ? ivas[0].id_iva : null;
          newCart.push({
            ...product,
            quantity: 1,
            id_valor_iva: defaultIva,
            id_descuento: null,
          });
        }

        return newCart;
      });
      toast.success(`"${product.nombre}" añadido al carrito.`);
    },
    [ivas]
  );

  // Función para actualizar la cantidad de un producto en el carrito
  const updateCartItemQuantity = useCallback(
    (id, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(id);
        return;
      }

      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) => {
          if (item.id_producto === id) {
            // Buscamos el producto original para validar stock
            const originalProduct = allProducts.find(
              (p) => p.id_producto === id
            );
            if (originalProduct && newQuantity > originalProduct.stock_actual) {
              toast.error(
                `No hay suficiente stock. Stock disponible: ${originalProduct.stock_actual}`
              );
              return item; // No actualizamos la cantidad
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        return updatedCart;
      });
    },
    [allProducts]
  );

  // Función para remover un producto del carrito
  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id_producto !== id));
    toast.success("Producto removido del carrito.");
  }, []);

  // Función para actualizar IVA de un producto en el carrito
  const updateCartItemIva = useCallback((id, newIvaId) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id_producto === id) {
          return { ...item, id_valor_iva: newIvaId };
        }
        return item;
      });
    });
  }, []);

  // Función para actualizar Descuento de un producto en el carrito
  const updateCartItemDiscount = useCallback((id, newDiscountId) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id_producto === id) {
          return { ...item, id_descuento: newDiscountId };
        }
        return item;
      });
    });
  }, []);

  // Calcular totales del carrito
  const calcularTotales = useCallback(() => {
    let subtotalSinIva = 0;
    let subtotalConIva = 0;
    let totalDescuento = 0;
    let totalPagar = 0;

    cart.forEach((item) => {
      const precio = parseFloat(item.precio);
      const cantidad = item.quantity;
      const subtotalItem = precio * cantidad;

      // Buscar el porcentaje de IVA
      const ivaObj = ivas.find((iva) => iva.id_iva === item.id_valor_iva);
      const porcentajeIva = ivaObj ? parseFloat(ivaObj.porcentaje_iva) : 0;

      // Buscar el porcentaje de descuento
      let porcentajeDescuento = 0;
      if (item.id_descuento) {
        const descObj = descuentos.find(
          (d) => d.id_descuento === item.id_descuento && d.activo
        );
        if (descObj && descObj.activo) {
          porcentajeDescuento = parseFloat(descObj.porcentaje_descuento);
        }
      }

      const descuentoItem = subtotalItem * (porcentajeDescuento / 100);
      const baseImponible = subtotalItem - descuentoItem;

      if (porcentajeIva > 0) {
        const valorIva = baseImponible * (porcentajeIva / 100);
        subtotalConIva += baseImponible;
        totalPagar += baseImponible + valorIva;
      } else {
        subtotalSinIva += baseImponible;
        totalPagar += baseImponible;
      }

      totalDescuento += descuentoItem;
    });

    const subtotal = subtotalSinIva + subtotalConIva;
    return {
      subtotal,
      subtotalSinIva,
      subtotalConIva,
      totalDescuento,
      totalPagar,
    };
  }, [cart, ivas, descuentos]);

  const {
    subtotal,
    subtotalSinIva,
    subtotalConIva,
    totalDescuento,
    totalPagar,
  } = calcularTotales();

  // Función para manejar la finalización de la venta
  const handleFinalizarVenta = async () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío.");
      return;
    }
    if (!selectedCliente) {
      toast.error("Por favor, seleccione un cliente.");
      return;
    }
    if (!user) {
      toast.error("Información de usuario no disponible.");
      return;
    }

    setLoadingSale(true);
    try {
      // Preparar los datos de la venta
      const ventaData = {
        id_cliente: selectedCliente.id_cliente, // Asumiendo que tienes el id_cliente en selectedCliente
        id_vendedor: user.id_usuario, // Tomado del contexto de autenticación
        productos: cart.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.quantity,
          id_valor_iva: item.id_valor_iva,
          id_descuento: item.id_descuento || null, // Puede ser null
        })),
        // No se incluye total aquí, lo calcula el backend
      };

      // Llamar al servicio a través del hook
      const result = await createSaleService(ventaData);

      if (result.success) {
        // El toast.success ya se maneja en el hook
        // Limpiar carrito y cliente después de una venta exitosa
        setCart([]);
        setSelectedCliente(null);
        // Opcional: Recargar productos si la venta afectó el stock globalmente (lo cual ya hace el backend y el hook de productos lo refresca si se llama)
        // loadInventoryData(); // Descomenta si necesitas refrescar stock aquí, aunque generalmente no es necesario si el backend gestiona bien el stock y se recarga en otras acciones.
      } else {
        // El toast.error ya se maneja en el hook
      }
    } catch (error) {
      // Este catch captura errores inesperados que no maneje el hook
      console.error("Error inesperado al finalizar la venta:", error);
      toast.error("Error inesperado al registrar la venta.");
    } finally {
      setLoadingSale(false);
    }
  };

  // --- Renderizado del componente ---
  if (productsLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Cargando productos...</div>
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
      <div className="mx-auto flex w-full max-w-full flex-col gap-8 lg:flex-row lg:gap-8">
        {/* Panel Izquierdo: Productos */}
        <div className="w-full lg:w-2/3">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
                  Nueva Venta
                </h1>
                <p className="text-base font-normal leading-normal text-text-secondary dark:text-background-light/70">
                  Busca productos y añádelos al carrito.
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-primary/60 dark:text-background-light/60">
                search
              </span>
              <input
                className="w-full rounded-lg border-primary/30 bg-white/50 py-3 pl-12 pr-4 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
                placeholder="Buscar por nombre, código o categoría..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-primary/20 bg-white/50 shadow-sm dark:border-primary/30 dark:bg-background-dark/50">
              <div className="overflow-x-auto">
                <Table
                  columns={productColumns}
                  data={filteredProducts}
                  onSort={() => {}} // Puedes implementar ordenamiento si es necesario
                  sortConfig={{ key: null, direction: "asc" }} // Temporal
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Carrito */}
        <div className="w-full lg:w-1/3 lg:pt-[92px]">
          <div className="sticky top-8 rounded-xl border border-primary/20 bg-white/50 p-6 shadow-lg dark:border-primary/30 dark:bg-background-dark/50">
            <div className="flex items-center justify-between border-b border-primary/20 pb-4 dark:border-primary/30">
              <h2 className="font-heading text-2xl font-bold text-text-primary dark:text-background-light">
                Detalle del Carrito
              </h2>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {cart.length}
              </span>
            </div>

            {/* Selección de Cliente - Este componente lo crearemos en el siguiente paso */}
            {/* <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-text-primary dark:text-background-light mb-2">Cliente</h3>
              <div className="flex items-center justify-between">
                <span>{selectedCliente ? selectedCliente.nombre : 'No seleccionado'}</span>
                <button className="text-primary hover:underline">Cambiar</button>
              </div>
            </div> */}

            {cart.length === 0 ? (
              <p className="text-center text-text-secondary dark:text-background-light/70 py-4">
                El carrito está vacío
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-6">
                {cart.map((item) => {
                  const ivaObj = ivas.find(
                    (iva) => iva.id_iva === item.id_valor_iva
                  );
                  const descuentoObj = descuentos.find(
                    (d) => d.id_descuento === item.id_descuento && d.activo
                  );

                  return (
                    <div
                      key={item.id_producto}
                      className="flex items-start gap-4 border-b border-primary/10 pb-4 dark:border-primary/20 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-text-primary dark:text-background-light">
                            {item.nombre}
                          </h3>
                          <p className="font-semibold text-text-primary dark:text-background-light">
                            ${(item.precio * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {/* Selector de Cantidad */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.id_producto,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/30 text-text-primary/80 transition hover:bg-primary/10 dark:border-primary/50 dark:text-background-light/80 dark:hover:bg-primary/20"
                            >
                              <span className="material-symbols-outlined text-base">
                                remove
                              </span>
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-text-primary dark:text-background-light">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.id_producto,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/30 text-text-primary/80 transition hover:bg-primary/10 dark:border-primary/50 dark:text-background-light/80 dark:hover:bg-primary/20"
                            >
                              <span className="material-symbols-outlined text-base">
                                add
                              </span>
                            </button>
                          </div>
                          {/* Selector de IVA */}
                          <select
                            value={item.id_valor_iva || ""}
                            onChange={(e) =>
                              updateCartItemIva(
                                item.id_producto,
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="text-xs rounded border border-primary/30 bg-white/50 py-1 px-2 dark:bg-background-dark/50 dark:border-primary/40 dark:text-background-light"
                          >
                            {ivas.map((iva) => (
                              <option key={iva.id_iva} value={iva.id_iva}>
                                {iva.porcentaje_iva}%
                              </option>
                            ))}
                          </select>
                          {/* Selector de Descuento */}
                          <select
                            value={item.id_descuento || ""}
                            onChange={(e) =>
                              updateCartItemDiscount(
                                item.id_producto,
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="text-xs rounded border border-primary/30 bg-white/50 py-1 px-2 dark:bg-background-dark/50 dark:border-primary/40 dark:text-background-light"
                          >
                            <option value="">Sin Descuento</option>
                            {descuentos
                              .filter((d) => d.activo)
                              .map((desc) => (
                                <option
                                  key={desc.id_descuento}
                                  value={desc.id_descuento}
                                >
                                  {desc.descuento} ({desc.porcentaje_descuento}
                                  %)
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id_producto)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-text-primary/60 transition hover:bg-red-500/10 hover:text-red-600 dark:text-background-light/60 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 border-t border-primary/20 pt-4 dark:border-primary/30">
              <div className="flex justify-between text-base font-medium text-text-primary dark:text-background-light">
                <p>Subtotal</p>
                <p>${subtotal.toFixed(2)}</p>
              </div>
              <div className="mt-1 flex justify-between text-sm text-text-secondary dark:text-background-light/70">
                <p>Sin IVA: ${subtotalSinIva.toFixed(2)}</p>
                <p>Con IVA: ${subtotalConIva.toFixed(2)}</p>
              </div>
              <div className="mt-2 flex justify-between text-base font-medium text-text-primary dark:text-background-light">
                <p>Descuento Total</p>
                <p>-${totalDescuento.toFixed(2)}</p>
              </div>
              <div className="mt-4 flex justify-between border-t border-primary/20 pt-4 text-xl font-bold text-primary dark:border-primary/30 dark:text-primary">
                <p>Total</p>
                <p>${totalPagar.toFixed(2)}</p>
              </div>
              <Button
                variant="primary"
                className="mt-6 w-full py-3 text-lg font-bold"
                onClick={handleFinalizarVenta}
                disabled={loadingSale || cart.length === 0 || !selectedCliente}
              >
                {loadingSale ? "Procesando..." : "Proceder al Pago"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesPage;
