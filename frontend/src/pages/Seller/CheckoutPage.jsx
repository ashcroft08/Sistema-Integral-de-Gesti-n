// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSales } from "../../hooks/useSales";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createSale } = useSales();

  // Datos recibidos de SalesPage
  const {
    cart,
    selectedCliente,
    selectedMetodoPago,
    tipoVenta,
    plazoCreditoDias,
    referenciaPago,
    totales,
  } = location.state || {};

  const [montoRecibido, setMontoRecibido] = useState("");
  const [loadingSale, setLoadingSale] = useState(false);

  // Redirigir si no hay datos
  useEffect(() => {
    if (!cart || !selectedCliente || !totales) {
      toast.error("No hay datos de venta. Redirigiendo...");
      navigate("/seller/sales", { replace: true });
    }
  }, [cart, selectedCliente, totales, navigate]);

  // Calcular cambio
  const calcularCambio = () => {
    const recibido = parseFloat(montoRecibido) || 0;
    const total = parseFloat(totales.totalPagar) || 0;
    const cambio = recibido - total;
    return cambio;
  };

  const cambio = calcularCambio();
  const montoRecibidoNum = Math.round((parseFloat(montoRecibido) || 0) * 100) / 100;
const totalNum = Math.round((parseFloat(totales.totalPagar) || 0) * 100) / 100;
const montoSuficiente = montoRecibidoNum >= totalNum;

  const handleFinalizarVenta = async () => {
    // Validación para ventas de contado
    if (tipoVenta === "CONTADO" && !montoSuficiente) {
      toast.error("El monto recibido es insuficiente");
      return;
    }

    setLoadingSale(true);
    try {
      const ventaData = {
        id_cliente: selectedCliente.id_cliente,
        id_metodo_pago: selectedMetodoPago.id_metodo_pago,
        tipo_venta: tipoVenta,
        plazo_credito_dias:
          tipoVenta === "CREDITO" ? parseInt(plazoCreditoDias) : null,
        referencia_pago: referenciaPago || null,
        productos: cart.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.quantity,
          id_valor_iva: item.id_valor_iva,
          id_descuento: item.id_descuento || null,
        })),
      };

      const result = await createSale(ventaData);
      if (result.success) {
        toast.success("Venta registrada correctamente");

        // ✅ Limpiar el estado guardado después de venta exitosa
        sessionStorage.removeItem("salesPage_state");

        // ✅ Navegar a página de éxito con datos de la factura
        navigate("/seller/sale-success", {
          replace: true,
          state: { factura: result.data },
        });
      }
    } catch (error) {
      console.error("Error finalizando venta:", error);
    } finally {
      setLoadingSale(false);
    }
  };

  if (!cart || !selectedCliente || !totales) {
    return null; // El useEffect redirigirá
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary mb-4 hover:underline transition-all"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            <span>Volver a la Venta</span>
          </button>
          <h1 className="text-4xl font-black tracking-tighter text-text-primary dark:text-background-light">
            {tipoVenta === "CREDITO"
              ? "Confirmar Venta a Crédito"
              : "Continuar al Pago"}
          </h1>
          <p className="text-text-secondary dark:text-background-light/70 mt-2">
            {tipoVenta === "CREDITO"
              ? "Revisa los detalles antes de registrar la venta a crédito."
              : "Ingresa el monto recibido para finalizar la venta."}
          </p>
        </header>

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA - RESUMEN (2 columnas) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl font-bold text-text-primary dark:text-background-light">
                  Cliente
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-text-primary dark:text-background-light">
                      {selectedCliente.nombre} {selectedCliente.apellido}
                    </p>
                    <p className="text-sm text-text-secondary dark:text-background-light/70">
                      {selectedCliente.identificacion}
                    </p>
                    {selectedCliente.email && (
                      <p className="text-sm text-text-secondary dark:text-background-light/70">
                        {selectedCliente.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen del Carrito */}
            <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl font-bold text-text-primary dark:text-background-light">
                  Resumen del Carrito
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item.id_producto}
                    className={`flex items-center justify-between ${
                      index !== cart.length - 1
                        ? "pb-4 border-b border-primary/10"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-text-primary dark:text-background-light">
                        {item.nombre}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-background-light/70">
                        {item.quantity} x ${parseFloat(item.precio).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-text-primary dark:text-background-light">
                      ${(item.precio * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="p-6 border-t border-primary/10 bg-gray-50/50 dark:bg-background-dark/20 rounded-b-xl space-y-3">
                <div className="flex justify-between text-sm text-text-secondary dark:text-background-light/70">
                  <span>Subtotal (0% IVA)</span>
                  <span>${totales.subtotalSinIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary dark:text-background-light/70">
                  <span>Subtotal (con IVA)</span>
                  <span>${totales.subtotalConIva.toFixed(2)}</span>
                </div>
                {totales.totalIva > 0 && (
                  <div className="flex justify-between text-sm text-text-secondary dark:text-background-light/70">
                    <span>IVA</span>
                    <span>${totales.totalIva.toFixed(2)}</span>
                  </div>
                )}
                {totales.totalDescuento > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento</span>
                    <span>-${totales.totalDescuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                  <span className="text-lg font-bold text-text-primary dark:text-background-light">
                    Total
                  </span>
                  <span className="text-2xl font-black text-primary">
                    ${totales.totalPagar.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - PAGO (1 columna) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm sticky top-8">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl font-bold text-text-primary dark:text-background-light">
                  Detalles del Pago
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Método de Pago */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-background-light/70 mb-2">
                    Método de Pago
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-background-dark/20 rounded-lg border border-primary/10">
                    <span className="material-symbols-outlined text-primary">
                      payments
                    </span>
                    <span className="font-medium text-text-primary dark:text-background-light">
                      {selectedMetodoPago.metodo_pago}
                    </span>
                  </div>
                </div>

                {/* Tipo de Venta */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-background-light/70 mb-2">
                    Tipo de Venta
                  </label>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      tipoVenta === "CREDITO"
                        ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                        : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        tipoVenta === "CREDITO"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {tipoVenta === "CREDITO" ? "schedule" : "check_circle"}
                    </span>
                    <div>
                      <span
                        className={`font-medium ${
                          tipoVenta === "CREDITO"
                            ? "text-yellow-800 dark:text-yellow-400"
                            : "text-green-800 dark:text-green-400"
                        }`}
                      >
                        {tipoVenta === "CREDITO"
                          ? "Venta a Crédito"
                          : "Venta de Contado"}
                      </span>
                      {tipoVenta === "CREDITO" && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                          Plazo: {plazoCreditoDias} días
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Monto Recibido (solo para CONTADO) */}
                {tipoVenta === "CONTADO" && (
                  <>
                    <div>
                      <label
                        className="block text-sm font-medium text-text-secondary dark:text-background-light/70 mb-2"
                        htmlFor="monto-recibido"
                      >
                        Monto Recibido
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary dark:text-background-light/70">
                          $
                        </span>
                        <input
                          id="monto-recibido"
                          type="number"
                          step="0.01"
                          min="0"
                          value={montoRecibido}
                          onChange={(e) => setMontoRecibido(e.target.value)}
                          placeholder={totales.totalPagar.toFixed(2)}
                          className="block w-full rounded-lg border-primary/30 bg-background-light dark:bg-background-dark/50 py-3 pl-7 pr-3 text-lg font-semibold focus:border-primary focus:ring-primary dark:text-background-light"
                        />
                      </div>
                    </div>

                    {/* Cambio */}
                    <div
                      className={`flex justify-between items-center p-4 rounded-lg ${
                        montoSuficiente && montoRecibidoNum > 0
                          ? "bg-primary/10"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          montoSuficiente && montoRecibidoNum > 0
                            ? "text-primary"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {montoSuficiente && montoRecibidoNum > 0
                          ? "Cambio a Devolver"
                          : "Falta"}
                      </span>
                      <span
                        className={`text-xl font-bold ${
                          montoSuficiente && montoRecibidoNum > 0
                            ? "text-primary"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        $
                        {montoSuficiente && montoRecibidoNum > 0
                          ? Math.max(0, cambio).toFixed(2)
                          : Math.abs(Math.min(0, cambio)).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {/* Referencia de Pago */}
                {referenciaPago && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-background-light/70 mb-2">
                      Referencia de Pago
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-background-dark/20 rounded-lg border border-primary/10">
                      <p className="text-sm font-mono text-text-primary dark:text-background-light">
                        {referenciaPago}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Finalizar */}
              <div className="p-6 border-t border-primary/10">
                <Button
                  onClick={handleFinalizarVenta}
                  disabled={
                    loadingSale || (tipoVenta === "CONTADO" && !montoSuficiente)
                  }
                  className="w-full py-3 text-lg flex items-center justify-center gap-2"
                >
                  {loadingSale ? (
                    <>
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span>
                        {tipoVenta === "CREDITO"
                          ? "Confirmar Venta a Crédito"
                          : "Finalizar Venta"}
                      </span>
                      <span className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </>
                  )}
                </Button>

                {tipoVenta === "CONTADO" &&
                  !montoSuficiente &&
                  montoRecibido && (
                    <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
                      El monto recibido debe ser igual o mayor al total
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CheckoutPage;
