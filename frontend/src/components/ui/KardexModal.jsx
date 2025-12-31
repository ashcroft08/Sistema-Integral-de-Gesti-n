import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const KardexModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  // Extraemos los movimientos. Si no hay, array vacío.
  const movimientos = product.MovimientoInventarios || [];

  // Función auxiliar para parsear el string "DD/MM/YYYY: Detalle..."
  // Esto permite darle un estilo diferente a la fecha y al mensaje.
  const parseMovimiento = (detalleStr) => {
    // Regex para buscar el patrón fecha al inicio
    const regex = /^(\d{2}\/\d{2}\/\d{4}):\s*(.*)/;
    const match = detalleStr.match(regex);

    if (match) {
      return {
        hasDate: true,
        date: match[1],
        text: match[2],
      };
    }
    // Si no cumple el formato, devolvemos todo como texto
    return { hasDate: false, text: detalleStr };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Movimientos (Kardex)"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* --- Encabezado del Producto (Resumen) --- */}
        <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h4 className="font-bold text-lg text-text-primary dark:text-background-light">
              {product.nombre}
            </h4>
            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 mt-1">
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono">
                {product.codigo_producto || "S/N"}
              </span>
              <span>•</span>
              <span>{product.CategoriaProducto?.categoria}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
              Stock Actual
            </span>
            <span
              className={`text-2xl font-mono font-bold ${
                product.stock_actual <= product.stock_minimo
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {product.stock_actual} uds.
            </span>
          </div>
        </div>

        {/* --- Lista de Movimientos (Timeline) --- */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {movimientos.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
                receipt_long
              </span>
              <p className="text-gray-500 dark:text-gray-400">
                No hay movimientos registrados para este producto.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6 pb-2">
              {movimientos.map((mov, index) => {
                const { hasDate, date, text } = parseMovimiento(mov.detalle);

                return (
                  <div key={index} className="mb-8 ml-6 relative group">
                    {/* Punto del timeline */}
                    <span className="absolute -left-[31px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-gray-800 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900">
                      {/* Icono pequeño dentro del punto */}
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    </span>

                    <div className="flex flex-col bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-700/50 shadow-sm rounded-lg p-3 hover:shadow-md transition-shadow">
                      {hasDate && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-sm text-gray-400">
                            calendar_month
                          </span>
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {date}
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-text-primary dark:text-gray-200 leading-relaxed">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default KardexModal;
