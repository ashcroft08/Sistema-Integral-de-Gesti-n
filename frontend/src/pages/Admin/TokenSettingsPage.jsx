// src/pages/Admin/TokenSettingsPage.jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import SuccessModal from "../../components/UI/SuccessModal";
import ErrorMessage from "../../components/UI/ErrorMessage";
import { useConfig } from "../../hooks/useConfig";
import { configService } from '../../services/config.service';

const TokenSettingsPage = () => {
  const {
    config,
    loading,
    error,
    success,
    updateTokenExpiration,
    clearError,
    clearSuccess,
  } = useConfig();

  const [expirationValue, setExpirationValue] = useState("30");
  const [expirationUnit, setExpirationUnit] = useState("Horas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalValues, setOriginalValues] = useState({
    expirationValue: "30",
    expirationUnit: "Horas",
  });

  // Cargar configuración cuando esté disponible
  useEffect(() => {
    if (config?.token) {
      const frontendConfig = configService.convertToFrontendFormat(
        config.token.tiempo_expiracion
      );
      setExpirationValue(frontendConfig.value);
      setExpirationUnit(frontendConfig.unit);
      setOriginalValues({
        expirationValue: frontendConfig.value,
        expirationUnit: frontendConfig.unit,
      });
    }
  }, [config]);

  // Mostrar modal cuando haya éxito
  useEffect(() => {
    if (success) {
      setIsModalOpen(true);
      setOriginalValues({ expirationValue, expirationUnit });
      clearSuccess();
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await updateTokenExpiration(expirationValue, expirationUnit);
    } catch (err) {
      // El error ya está manejado en el hook
      console.error("Error al actualizar:", err);
    }
  };

  const handleCancel = () => {
    setExpirationValue(originalValues.expirationValue);
    setExpirationUnit(originalValues.expirationUnit);
    clearError();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const hasChanges =
    expirationValue !== originalValues.expirationValue ||
    expirationUnit !== originalValues.expirationUnit;

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
          Configuración de Token
        </h1>
        <p className="text-base font-normal leading-normal text-text-secondary dark:text-background-light/70">
          Administra el tiempo de vida de los tokens de autenticación.
        </p>
      </div>

      {/* Mostrar error */}
      {error && <ErrorMessage message={error} onClose={clearError} />}

      {/* Formulario */}
      <div className="rounded-xl border border-primary/20 bg-white/50 p-6 shadow-sm dark:border-primary/30 dark:bg-background-dark/50 sm:p-8">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="token-expiration"
                className="block text-sm font-medium leading-6 text-text-primary dark:text-background-light"
              >
                Tiempo de Expiración del Token
              </label>
              <div className="mt-2 flex rounded-lg shadow-sm">
                <input
                  type="number"
                  name="token-expiration-value"
                  id="token-expiration"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-l-lg border-0 bg-background-light/50 px-3 py-2 text-text-primary ring-1 ring-inset ring-primary/30 placeholder:text-text-secondary/50 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-background-dark/30 dark:text-background-light dark:ring-primary/40 dark:focus:ring-primary"
                  placeholder="30"
                  value={expirationValue}
                  onChange={(e) => setExpirationValue(e.target.value)}
                  min="1"
                  disabled={loading}
                />
                <select
                  id="token-expiration-unit"
                  name="token-expiration-unit"
                  className="block rounded-r-lg border-0 bg-background-light/80 py-2 pl-3 pr-8 text-text-primary ring-1 ring-inset ring-primary/30 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-background-dark/50 dark:text-background-light dark:ring-primary/40 dark:focus:ring-primary"
                  value={expirationUnit}
                  onChange={(e) => setExpirationUnit(e.target.value)}
                  disabled={loading}
                >
                  <option>Minutos</option>
                  <option>Horas</option>
                  <option>Días</option>
                </select>
              </div>
              <p className="mt-2 text-sm text-text-secondary/80 dark:text-background-light/60">
                Define cuánto tiempo será válido un token después de su
                creación. Máximo permitido: 30 días.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-primary/20 pt-6 dark:border-primary/30">
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
        message="Configuración de Token Actualizada Correctamente."
      />
    </AdminLayout>
  );
};

export default TokenSettingsPage;
