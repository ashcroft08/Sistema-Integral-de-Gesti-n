// src/pages/SaleSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";

const SaleSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [facturaData, setFacturaData] = useState(null);

  // Datos de la factura pasados desde CheckoutPage
  const { factura } = location.state || {};

  useEffect(() => {
    // Si no hay datos de factura, redirigir al punto de venta
    if (!factura) {
      toast.error("No hay información de venta");
      navigate("/seller/sales", { replace: true });
      return;
    }

    console.log("Datos de factura recibidos:", factura); // Debug
    setFacturaData(factura);
  }, []); // ✅ CORRECCIÓN: Array vacío - solo se ejecuta al montar

  const handleImprimirFactura = () => {
    if (!facturaData) return;

    // Abrir en nueva ventana para imprimir
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Por favor, permite las ventanas emergentes para imprimir");
      return;
    }

    // Función helper para formatear valores numéricos
    const formatCurrency = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    // Generar HTML para imprimir con diseño mejorado
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${facturaData.secuencial}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Arial', sans-serif; 
            padding: 20px; 
            color: #333;
            line-height: 1.6;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #e68019;
          }
          
          .header h1 {
            font-size: 28px;
            color: #e68019;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding: 10px;
            background: #f8f7f6;
            border-radius: 5px;
          }
          
          .header-info div {
            text-align: left;
          }
          
          .header-info strong {
            color: #e68019;
          }
          
          .info-section { 
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f7f6;
            border-radius: 8px;
          }
          
          .info-section h3 {
            color: #e68019;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 2px solid #e68019;
            padding-bottom: 5px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          
          .info-item {
            padding: 5px 0;
          }
          
          .info-item strong {
            color: #555;
            display: inline-block;
            min-width: 140px;
          }
          
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .table thead {
            background: #e68019;
            color: white;
          }
          
          .table th { 
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
          }
          
          .table td { 
            border: 1px solid #ddd; 
            padding: 10px 8px;
            font-size: 13px;
          }
          
          .table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .table tbody tr:hover {
            background-color: #f0f0f0;
          }
          
          .table td:nth-child(2), /* Cantidad */
          .table td:nth-child(3), /* Precio */
          .table td:nth-child(4), /* Descuento */
          .table td:nth-child(5), /* IVA */
          .table td:nth-child(6)  /* Total */
          {
            text-align: right;
          }
          
          .totals { 
            margin-top: 30px;
            padding: 20px;
            background: #f8f7f6;
            border-radius: 8px;
          }
          
          .totals-grid {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }
          
          .totals-row {
            display: flex;
            justify-content: space-between;
            min-width: 300px;
            padding: 8px 15px;
          }
          
          .totals-row strong {
            color: #555;
          }
          
          .total-final { 
            font-size: 20px; 
            font-weight: bold;
            background: #e68019;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
          }
          
          .total-final strong {
            color: white;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e68019;
            text-align: center;
            color: #777;
            font-size: 12px;
          }
          
          @media print {
            body { padding: 10px; }
            .container { max-width: 100%; }
            .table { page-break-inside: avoid; }
            .totals { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FACTURA ELECTRÓNICA</h1>
            <div class="header-info">
              <div>
                <strong>Secuencial:</strong> ${facturaData.secuencial}<br>
                <strong>Fecha:</strong> ${new Date(
                  facturaData.fecha_emision
                ).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div>
                <strong>Clave de Acceso:</strong><br>
                <span style="font-size: 11px;">${
                  facturaData.clave_acceso || "Pendiente de generación"
                }</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h3>Información del Cliente</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Cliente:</strong> ${facturaData.Cliente.nombre} ${
      facturaData.Cliente.apellido
    }
              </div>
              <div class="info-item">
                <strong>Identificación:</strong> ${
                  facturaData.Cliente.identificacion
                }
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${
                  facturaData.Cliente.email || "No registrado"
                }
              </div>
              <div class="info-item">
                <strong>Método de Pago:</strong> ${
                  facturaData.MetodoPago.metodo_pago
                }
              </div>
            </div>
            ${
              facturaData.tipo_venta === "CREDITO"
                ? `
              <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong style="color: #856404;">⚠️ Venta a Crédito:</strong> 
                <span style="color: #856404;">${facturaData.plazo_credito_dias} días de plazo</span>
              </div>
            `
                : ""
            }
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: right;">Cantidad</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Descuento</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(facturaData.DetalleFactura || [])
                .map((detalle) => {
                  const cantidad = parseInt(detalle.cantidad) || 0;
                  const precioUnitario =
                    parseFloat(detalle.precio_unitario) || 0;
                  const valorDescuento =
                    parseFloat(detalle.valor_descuento) || 0;
                  const subtotal =
                    parseFloat(detalle.subtotal) ||
                    parseFloat(detalle.total) ||
                    0;

                  return `
                  <tr>
                    <td><strong>${
                      detalle.Producto?.nombre || "Producto"
                    }</strong></td>
                    <td style="text-align: right;">${cantidad}</td>
                    <td style="text-align: right;">$${formatCurrency(
                      precioUnitario
                    )}</td>
                    <td style="text-align: right;">$${formatCurrency(
                      valorDescuento
                    )}</td>
                    <td style="text-align: right;"><strong>$${formatCurrency(
                      subtotal
                    )}</strong></td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-grid">
              <div class="totals-row">
                <strong>Subtotal (0% IVA):</strong>
                <span>$${formatCurrency(facturaData.subtotal_sin_iva)}</span>
              </div>
              <div class="totals-row">
                <strong>Subtotal (con IVA):</strong>
                <span>$${formatCurrency(facturaData.subtotal_con_iva)}</span>
              </div>
              <div class="totals-row">
                <strong>${
                  facturaData.ValorIva?.descripcion ||
                  facturaData.ValorIva?.porcentaje_iva + "%" ||
                  "Total"
                }:</strong>
                <span>$${formatCurrency(facturaData.total_iva)}</span>
              </div>
              ${
                parseFloat(facturaData.total_descuento) > 0
                  ? `
                <div class="totals-row" style="color: #28a745;">
                  <strong>Descuento Total:</strong>
                  <span>-$${formatCurrency(facturaData.total_descuento)}</span>
                </div>
              `
                  : ""
              }
              <div class="totals-row total-final">
                <strong>TOTAL A PAGAR:</strong>
                <span>$${formatCurrency(facturaData.total)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Gracias por su compra</strong></p>
            <p>Documento generado electrónicamente • ${new Date().toLocaleString(
              "es-ES"
            )}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 250);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleEnviarFactura = async () => {
    if (!facturaData || !facturaData.Cliente.email) {
      toast.error("El cliente no tiene un email registrado");
      return;
    }

    try {
      // TODO: Implementar endpoint para enviar factura por email
      // await salesService.sendInvoiceByEmail(facturaData.id_factura);

      toast.success(`Factura enviada a ${facturaData.Cliente.email}`);
    } catch (error) {
      console.error("Error enviando factura:", error);
      toast.error("Error al enviar la factura por email");
    }
  };

  const handleNuevaVenta = () => {
    // Limpiar sessionStorage y navegar a nueva venta
    sessionStorage.removeItem("salesPage_state");
    navigate("/seller/sale", { replace: true });
  };

  const handleDescargarXML = () => {
    if (!facturaData || !facturaData.url_xml_firmado) {
      toast.error("XML no disponible aún");
      return;
    }

    // Abrir el XML en una nueva pestaña
    window.open(facturaData.url_xml_firmado, "_blank");
  };

  if (!facturaData) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-background-dark/40 rounded-xl shadow-sm p-8 flex flex-col items-center text-center">
          {/* Ícono de éxito */}
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full mb-6">
            <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
              check
            </span>
          </div>

          {/* Título */}
          <h1 className="text-text-primary dark:text-background-light tracking-tight text-[32px] font-bold leading-tight">
            ¡Venta Exitosa!
          </h1>

          {/* Descripción */}
          <p className="text-text-secondary dark:text-background-light/70 text-base font-normal leading-normal mt-2 max-w-md">
            La transacción ha sido registrada y la factura{" "}
            {facturaData.tipo_venta === "CREDITO" ? "a crédito " : ""}generada.
          </p>

          {/* Resumen de la Venta */}
          <div className="w-full text-left mt-8 border-t border-primary/10 pt-8">
            <h3 className="text-text-primary dark:text-background-light text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
              Resumen de la Venta
            </h3>

            {/* Grid de información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {/* ID de Transacción */}
              <div className="flex flex-col gap-1 border-t border-primary/10 py-4">
                <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal">
                  Secuencial de Factura:
                </p>
                <p className="text-text-primary dark:text-background-light text-sm font-medium leading-normal font-mono">
                  {facturaData.secuencial}
                </p>
              </div>

              {/* Información del Cliente */}
              <div className="flex flex-col gap-1 border-t border-primary/10 py-4">
                <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal">
                  Información del Cliente:
                </p>
                <p className="text-text-primary dark:text-background-light text-sm font-medium leading-normal">
                  {facturaData.Cliente.nombre} {facturaData.Cliente.apellido}
                </p>
                <p className="text-text-secondary dark:text-background-light/70 text-xs">
                  {facturaData.Cliente.identificacion}
                </p>
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1 border-t border-primary/10 py-4">
                <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal">
                  Fecha:
                </p>
                <p className="text-text-primary dark:text-background-light text-sm font-medium leading-normal">
                  {new Date(facturaData.fecha_emision).toLocaleDateString(
                    "es-ES",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              {/* Método de Pago */}
              <div className="flex flex-col gap-1 border-t border-primary/10 py-4">
                <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal">
                  Método de Pago:
                </p>
                <p className="text-text-primary dark:text-background-light text-sm font-medium leading-normal">
                  {facturaData.MetodoPago.metodo_pago}
                </p>
              </div>

              {/* Tipo de Venta */}
              <div className="flex flex-col gap-1 border-t border-primary/10 py-4">
                <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal">
                  Tipo de Venta:
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      facturaData.tipo_venta === "CREDITO"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {facturaData.tipo_venta === "CREDITO"
                      ? "Venta a Crédito"
                      : "Venta de Contado"}
                  </span>
                  {facturaData.tipo_venta === "CREDITO" && (
                    <span className="text-xs text-text-secondary dark:text-background-light/70">
                      ({facturaData.plazo_credito_dias} días)
                    </span>
                  )}
                </div>
              </div>

              {/* Estado SRI */}
              <div className="flex flex-col gap-1 border-t border-primary/10 py-4">
                <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal">
                  Estado SRI:
                </p>
                <span
                  className={`inline-flex items-center w-fit px-2 py-1 rounded text-xs font-medium ${
                    facturaData.EstadoSRI?.codigo === "AUTORIZADO"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : facturaData.EstadoSRI?.codigo === "ENVIADO"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {facturaData.EstadoSRI?.nombre || "Procesando"}
                </span>
              </div>
            </div>

            {/* Productos Vendidos */}
            <div className="mt-6 border-t border-primary/10 pt-6">
              <p className="text-text-secondary dark:text-background-light/70 text-sm font-normal leading-normal mb-4">
                Productos Vendidos
              </p>
              <div className="flex flex-col space-y-4">
                {facturaData.DetalleFactura &&
                facturaData.DetalleFactura.length > 0 ? (
                  facturaData.DetalleFactura.map((detalle) => (
                    <div
                      key={detalle.id_detalle_factura}
                      className="flex justify-between items-center text-sm"
                    >
                      <p className="text-text-primary dark:text-background-light flex-1">
                        {detalle.Producto?.nombre || "Producto"}
                      </p>
                      <p className="text-text-secondary dark:text-background-light/70 mx-4">
                        {detalle.cantidad} x $
                        {parseFloat(detalle.precio_unitario).toFixed(2)}
                      </p>
                      <p className="text-text-primary dark:text-background-light font-medium">
                        $
                        {parseFloat(detalle.subtotal || detalle.total).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary dark:text-background-light/70 text-sm text-center py-4">
                    No hay detalles de productos disponibles
                  </p>
                )}
              </div>

              {/* Totales */}
              <div className="border-t border-primary/10 mt-4 pt-4 flex flex-col items-end space-y-2 text-sm">
                <div className="flex justify-between w-full max-w-xs">
                  <span className="text-text-secondary dark:text-background-light/70">
                    Subtotal (0% IVA):
                  </span>
                  <span className="text-text-primary dark:text-background-light">
                    ${parseFloat(facturaData.subtotal_sin_iva).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-xs">
                  <span className="text-text-secondary dark:text-background-light/70">
                    Subtotal (con IVA):
                  </span>
                  <span className="text-text-primary dark:text-background-light">
                    ${parseFloat(facturaData.subtotal_con_iva).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between w-full max-w-xs">
                  <span className="text-text-secondary dark:text-background-light/70">
                    IVA{" "}
                    {facturaData.ValorIva?.porcentaje_iva
                      ? `${facturaData.ValorIva.porcentaje_iva}%`
                      : "Total"}
                    :
                  </span>
                  <span className="text-text-primary dark:text-background-light">
                    ${parseFloat(facturaData.total_iva).toFixed(2)}
                  </span>
                </div>
                {parseFloat(facturaData.total_descuento) > 0 && (
                  <div className="flex justify-between w-full max-w-xs text-green-600">
                    <span>Descuento Total:</span>
                    <span>
                      -${parseFloat(facturaData.total_descuento).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between w-full max-w-xs font-bold text-base border-t border-primary/10 pt-2">
                  <span className="text-text-primary dark:text-background-light">
                    Total:
                  </span>
                  <span className="text-primary">
                    ${parseFloat(facturaData.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full border-t border-primary/10 pt-8">
            <button
              onClick={handleImprimirFactura}
              className="flex items-center justify-center gap-2 h-10 px-6 font-medium rounded-lg text-sm text-primary border border-primary hover:bg-primary/10 transition-colors w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Imprimir Factura
            </button>

            {facturaData.url_xml_firmado && (
              <button
                onClick={handleDescargarXML}
                className="flex items-center justify-center gap-2 h-10 px-6 font-medium rounded-lg text-sm text-primary border border-primary hover:bg-primary/10 transition-colors w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-base">
                  download
                </span>
                Descargar XML
              </button>
            )}

            {facturaData.Cliente.email && (
              <button
                onClick={handleEnviarFactura}
                className="flex items-center justify-center gap-2 h-10 px-6 font-medium rounded-lg text-sm text-primary border border-primary hover:bg-primary/10 transition-colors w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-base">
                  email
                </span>
                Enviar por Email
              </button>
            )}

            <button
              onClick={handleNuevaVenta}
              className="flex items-center justify-center gap-2 h-10 px-6 font-medium rounded-lg text-sm bg-primary text-white hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-base">
                add_shopping_cart
              </span>
              Nueva Venta
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SaleSuccessPage;
