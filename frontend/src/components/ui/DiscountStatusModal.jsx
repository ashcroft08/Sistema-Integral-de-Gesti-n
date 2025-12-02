import React from "react";
import Modal from "./Modal";

const DiscountStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  discount,
  isLoading,
}) => {
  if (!isOpen || !discount) return null;

  // Lógica de negocio:
  // Si discount.activo es true, la acción es DESACTIVAR.
  // Si discount.activo es false, la acción es ACTIVAR.
  const isDeactivating = discount.activo;

  // --- LÓGICA DE TEXTOS ---
  let title = "";
  let message = null;
  let confirmText = "";
  let icon = "";

  if (isDeactivating) {
    title = "Desactivar Descuento";
    confirmText = "Desactivar";
    icon = "toggle_off";
    message = (
      <>
        ¿Está seguro de que desea desactivar el descuento{" "}
        <span className="font-bold">{discount.descuento}</span>?
      </>
    );
  } else {
    title = "Activar Descuento";
    confirmText = "Activar";
    icon = "check_circle";
    message = (
      <>
        ¿Está seguro de que desea activar el descuento{" "}
        <span className="font-bold">{discount.descuento}</span>?
      </>
    );
  }

  // --- ESTILOS DINÁMICOS (Mismo diseño que CategoryStatusModal) ---
  const themeStyles = {
    activate: {
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      btnConfirm:
        "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600",
    },
    deactivate: {
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      btnConfirm:
        "bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-600",
    },
  };

  // Seleccionar estilo actual
  const currentStyle = isDeactivating
    ? themeStyles.deactivate
    : themeStyles.activate;

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${currentStyle.btnConfirm}`}
        type="button"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <span
              className="material-symbols-outlined text-lg"
              aria-hidden="true"
            >
              {icon}
            </span>
            {confirmText}
          </>
        )}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col items-center text-center">
        {/* Ícono Circular */}
        <div
          className={`mb-4 flex size-16 items-center justify-center rounded-full ${currentStyle.iconBg}`}
        >
          <span
            className={`material-symbols-outlined text-3xl ${currentStyle.iconColor}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>

        {/* Mensaje Principal */}
        <p className="text-gray-600 dark:text-gray-300 text-base">{message}</p>

        {/* Alerta Específica para Desactivar */}
        {isDeactivating && (
          <div className="mt-5 w-full rounded-md bg-amber-50 p-4 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50 text-left">
            <div className="flex">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 mr-3 text-xl">
                info
              </span>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <h4 className="font-bold mb-1">Impacto en ventas</h4>
                <p>
                  Este descuento dejará de aplicarse automáticamente en las
                  nuevas ventas hasta que sea reactivado.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DiscountStatusModal;
