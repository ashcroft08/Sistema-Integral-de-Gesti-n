// src/components/UI/SuccessModal.jsx
import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const SuccessModal = ({
  isOpen,
  onClose,
  title = "Operación Exitosa",
  message = "La operación se ha completado correctamente.",
  btnText = "Aceptar",
}) => {
  if (!isOpen) return null;

  // Estilo consistente con tu sistema de diseño (Green Theme)
  const theme = {
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    btnClass: "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600",
  };

  // Footer con un solo botón de confirmación
  const footer = (
    <Button
      onClick={onClose}
      className={`w-full justify-center text-white shadow-sm ${theme.btnClass}`}
      type="button"
    >
      {btnText}
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      // closeOnlyWithX={false} // Opcional: permite cerrar clicando fuera si quieres
    >
      <div className="flex flex-col items-center text-center">
        {/* Ícono Circular Grande */}
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${theme.iconBg}`}
        >
          <span
            className={`material-symbols-outlined text-4xl ${theme.iconColor}`}
          >
            check_circle
          </span>
        </div>

        {/* Mensaje */}
        <div className="space-y-2">
          <p className="text-text-secondary dark:text-background-light/70 text-base">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
