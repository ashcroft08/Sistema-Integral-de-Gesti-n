import React from "react";
import Modal from "./Modal";

const PasswordResetModal = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen || !user) return null;

  const footer = (
    <>
      <button
        onClick={onClose}
        className="rounded-lg border border-primary/50 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-primary/10 dark:border-primary/60 dark:text-background-light/90 dark:hover:bg-primary/20"
        type="button"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        type="button"
      >
        <span className="material-symbols-outlined text-base">lock_reset</span>
        Restablecer Contraseña
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restablecer Contraseña" footer={footer}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
            lock_reset
          </span>
        </div>
        <p className="mt-2 text-text-secondary dark:text-background-light/70 break-words">
          ¿Está seguro de que desea restablecer la contraseña de{" "}
          <strong>{user.nombre} {user.apellido}</strong>?
        </p>
        <p className="mt-2 text-sm text-text-secondary/70 dark:text-background-light/50">
          Se generará una nueva contraseña aleatoria y se enviará al correo del usuario.
        </p>
      </div>
    </Modal>
  );
};

export default PasswordResetModal;