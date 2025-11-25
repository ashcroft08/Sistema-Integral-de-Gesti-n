// src/components/UI/StatusConfirmationModal.jsx
import React from "react";
import Modal from "./Modal";

const StatusConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  action,
}) => {
  if (!isOpen || !user) return null;

  const isActivating = action === "activate";
  const isDeleting = action === "delete";

  // Normalizar rol para evitar errores si la estructura del objeto cambia
  const userRole = user?.Rol?.rol || user?.rol || "Usuario";
  // Evitar hardcodear IDs (2) si es posible, pero funcional por ahora
  const isAdminUser = userRole === "Administrador" || user?.id_rol === 2;
  const isSuperuserUser = userRole === "Superusuario" || user?.id_rol === 1;
  const isProtectedUser = isAdminUser || isSuperuserUser;

  // --- LÓGICA DE TEXTOS ---
  let title = "";
  let message = null;
  let confirmText = "";
  let icon = "";

  if (isDeleting) {
    title = "Eliminar Usuario Permanentemente";
    confirmText = "Sí, Eliminar";
    icon = "delete_forever";
    message = (
      <>
        Está a punto de eliminar a <span className="font-bold">{user.nombre} {user.apellido}</span> ({userRole}).
        {isProtectedUser && (
          <>
            <br />
            <span className="font-bold text-red-600 dark:text-red-400">
              ⚠️ Este usuario no puede ser eliminado. {isSuperuserUser ? 'El Superusuario' : 'Los Administradores'} solo pueden ser desactivados para mantener la integridad de los datos.
            </span>
          </>
        )}
      </>
    );
  } else if (isActivating) {
    title = "Activar Usuario";
    confirmText = "Activar Acceso";
    icon = "how_to_reg"; // O "check_circle"
    message = `¿Desea reactivar el acceso al sistema para ${user.nombre} ${user.apellido}?`;
  } else {
    title = "Desactivar Usuario";
    confirmText = "Desactivar";
    icon = "person_off"; // O "block"
    message = `¿Desea suspender el acceso al sistema para ${user.nombre} ${user.apellido}?`;
  }

  // --- ESTILOS DINÁMICOS ---
  const themeStyles = {
    delete: {
      iconBg: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400",
      btnConfirm: "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600",
    },
    activate: {
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400", // Ajustado a colores standard de Tailwind si 'status-online' falla
      btnConfirm: "bg-green-600 hover:bg-green-700 focus-visible:outline-green-600",
    },
    deactivate: {
      iconBg: "bg-orange-100 dark:bg-orange-900/30", // Cambié a naranja para diferenciar de "Eliminar"
      iconColor: "text-orange-600 dark:text-orange-400",
      btnConfirm: "bg-orange-600 hover:bg-orange-700 focus-visible:outline-orange-600",
    }
  };

  // Seleccionar estilo actual
  const currentStyle = isDeleting 
    ? themeStyles.delete 
    : isActivating 
      ? themeStyles.activate 
      : themeStyles.deactivate;

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
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${currentStyle.btnConfirm}`}
        type="button"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">{icon}</span>
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col items-center text-center">
        {/* Ícono Circular */}
        <div className={`mb-4 flex size-16 items-center justify-center rounded-full ${currentStyle.iconBg}`}>
          <span className={`material-symbols-outlined text-3xl ${currentStyle.iconColor}`} aria-hidden="true">
            {icon}
          </span>
        </div>

        {/* Mensaje Principal */}
        <p className="text-gray-600 dark:text-gray-300 text-base">
          {message}
        </p>

        {/* Alerta Específica para Borrado (UX: Friction) */}
        {isDeleting && (
          <div className="mt-5 w-full rounded-md bg-red-50 p-4 border border-red-100 dark:bg-red-900/20 dark:border-red-800/50 text-left">
            <div className="flex">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-3 text-xl">warning</span>
              <div className="text-sm text-red-700 dark:text-red-300">
                <h4 className="font-bold mb-1">Esta acción es irreversible</h4>
                <p>Se eliminarán todos los datos asociados, historial y configuraciones de este usuario. No podrá deshacer este cambio.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StatusConfirmationModal;