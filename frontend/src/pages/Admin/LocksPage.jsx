// src/pages/Admin/LocksPage.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/Layout/AdminLayout";
import InputFieldForm from "../../components/UI/InputFieldForm";
import Button from "../../components/UI/Button";
import SuccessModal from "../../components/UI/SuccessModal";
import Modal from "../../components/UI/Modal";
import ErrorMessage from "../../components/UI/ErrorMessage";
import { useConfig } from "../../hooks/useConfig";

const LocksPage = () => {
  const {
    config,
    loading,
    error,
    success,
    updateBlockConfig,
    convertLockoutDurationToFrontend,
    convertLockoutDurationToBackend,
    clearError,
    clearSuccess,
  } = useConfig();

  // Estados para manejar los valores del formulario
  const [failedAttempts, setFailedAttempts] = useState("5");
  const [lockoutDuration, setLockoutDuration] = useState("30");
  const [lockoutUnit, setLockoutUnit] = useState("Minutos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalValues, setOriginalValues] = useState({
    failedAttempts: "5",
    lockoutDuration: "30",
    lockoutUnit: "Minutos",
  });

  // Cargar configuración cuando esté disponible
  useEffect(() => {
    if (config?.bloqueo) {
      const bloqueo = config.bloqueo;
      setFailedAttempts(bloqueo.intentos_maximos.toString());

      const frontendDuration = convertLockoutDurationToFrontend(
        bloqueo.duracion_bloqueo_minutos
      );
      setLockoutDuration(frontendDuration.duration);
      setLockoutUnit(frontendDuration.unit);

      setOriginalValues({
        failedAttempts: bloqueo.intentos_maximos.toString(),
        lockoutDuration: frontendDuration.duration,
        lockoutUnit: frontendDuration.unit,
      });
    }
  }, [config]);

  // Mostrar modal cuando haya éxito
  useEffect(() => {
    if (success) {
      setIsModalOpen(true);
      setOriginalValues({
        failedAttempts,
        lockoutDuration,
        lockoutUnit,
      });
      clearSuccess();
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const intentos_maximos = parseInt(failedAttempts);
      const duracion_bloqueo_minutos = convertLockoutDurationToBackend(
        lockoutDuration,
        lockoutUnit
      );

      await updateBlockConfig(intentos_maximos, duracion_bloqueo_minutos);
    } catch (err) {
      // El error ya está manejado en el hook
      console.error("Error al actualizar configuración de bloqueo:", err);
    }
  };

  const handleCancel = () => {
    setFailedAttempts(originalValues.failedAttempts);
    setLockoutDuration(originalValues.lockoutDuration);
    setLockoutUnit(originalValues.lockoutUnit);
    clearError();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const hasChanges =
    failedAttempts !== originalValues.failedAttempts ||
    lockoutDuration !== originalValues.lockoutDuration ||
    lockoutUnit !== originalValues.lockoutUnit;

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
          Configuración de Bloqueo de Cuenta
        </h1>
        <p className="text-base font-normal leading-normal text-text-secondary dark:text-background-light/70">
          Gestiona los ajustes para los bloqueos de cuenta tras intentos
          fallidos de inicio de sesión.
        </p>
      </div>

      {/* Mostrar error */}
      {error && <ErrorMessage message={error} onClose={clearError} />}

      {/* Formulario */}
      <div className="rounded-xl border border-primary/20 bg-white/50 p-8 shadow-sm dark:border-primary/30 dark:bg-background-dark/50">
        <form
          id="lockoutForm"
          className="flex flex-col gap-8"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <InputFieldForm
                label="Número de Intentos Fallidos Permitidos"
                name="failed-attempts"
                type="number"
                placeholder="Ej: 5"
                value={failedAttempts}
                onChange={(e) => setFailedAttempts(e.target.value)}
                error=""
                min="1"
                max="10"
                disabled={loading}
              />
              <p className="text-xs text-text-secondary dark:text-background-light/70">
                El número de intentos antes de que la cuenta sea bloqueada.
                Mínimo: 1, Máximo: 10
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary dark:text-background-light">
                Tiempo de Bloqueo de Cuenta
              </label>
              <div className="flex">
                <InputFieldForm
                  name="lockout-duration"
                  type="number"
                  placeholder="Ej: 30"
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(e.target.value)}
                  inputClassName="rounded-r-none border-r-0 focus:ring-0"
                  error=""
                  min="1"
                  max={lockoutUnit === "Horas" ? "24" : "1440"}
                  disabled={loading}
                />
                <select
                  className="h-14 rounded-r-lg border-l-0 border-primary/30 bg-background-light/80 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/70 dark:text-background-light"
                  value={lockoutUnit}
                  onChange={(e) => setLockoutUnit(e.target.value)}
                  disabled={loading}
                >
                  <option>Minutos</option>
                  <option>Horas</option>
                </select>
              </div>
              <p className="text-xs text-text-secondary dark:text-background-light/70">
                {lockoutUnit === "Horas"
                  ? "La duración del bloqueo de la cuenta. Máximo: 24 horas"
                  : "La duración del bloqueo de la cuenta. Máximo: 1440 minutos (24 horas)"}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-4 border-t border-primary/20 pt-6 dark:border-primary/30">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={loading || !hasChanges}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasChanges}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    refresh
                  </span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Actualización Exitosa"
        message="Configuración de Bloqueo de Cuenta Actualizada Correctamente."
      />
    </AdminLayout>
  );
};

export default LocksPage;
