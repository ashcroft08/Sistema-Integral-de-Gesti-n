// src/components/UI/ProductStatusConfirmationModal.jsx
import React from "react";
import Modal from "./Modal";

const ProductStatusConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  isDanger = false,
}) => {
  if (!isOpen) return null;

  // Determinar el ícono y estilos según el tipo de acción
  const isActivating = confirmText === "Activar";
  const icon = isActivating ? "check_circle" : "block";

  const themeStyles = isDanger
    ? {
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        btnConfirm: "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600",
      }
    : {
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        btnConfirm:
          "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600",
      };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        type="button"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${themeStyles.btnConfirm}`}
        type="button"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          {icon}
        </span>
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col items-center text-center">
        {/* Ícono Circular */}
        <div
          className={`mb-4 flex size-16 items-center justify-center rounded-full ${themeStyles.iconBg}`}
        >
          <span
            className={`material-symbols-outlined text-3xl ${themeStyles.iconColor}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>

        {/* Mensaje Principal */}
        <p className="text-gray-600 dark:text-gray-300 text-base">{message}</p>
      </div>
    </Modal>
  );
};

export default ProductStatusConfirmationModal;
