// src/components/UI/Modal.jsx
import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnlyWithX = true, // CAMBIO UX: Por defecto permitir cerrar con clic fuera
  maxWidth = "max-w-2xl", //  Prop para controlar el ancho
}) => {
  // Bloquear scroll del body cuando el modal está abierto (Mejora UX)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnlyWithX) return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-background-dark rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body - Con scroll si el contenido es muy largo */}
        <div className="p-6 overflow-y-auto">{children}</div>

        {/* Footer - Renderizado condicional correcto */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
