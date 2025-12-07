import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const CertificateStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  certificate,
  isLoading,
}) => {
  if (!certificate) return null;

  const isActive = certificate.activo;
  const action = isActive ? "desactivar" : "activar";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${action.charAt(0).toUpperCase() + action.slice(1)} Certificado`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl mt-0.5">
            warning
          </span>
          <div className="flex-1">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              ¿Estás seguro que deseas <strong>{action}</strong> el certificado{" "}
              <strong>"{certificate.nombre}"</strong>?
            </p>
            {isActive && (
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-2">
                No podrás firmar facturas con este certificado hasta que lo
                actives nuevamente.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1" disabled={isLoading}>
            {isLoading ? "Procesando..." : `Sí, ${action}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateStatusModal;
