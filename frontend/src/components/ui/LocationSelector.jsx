import React, { useState, useEffect, useRef } from "react";
import { useLocations } from "../../hooks/useLocations";

const LocationSelector = ({
  value,
  initialValue,
  onChange,
  error,
  disabled = false,
  required = true,
}) => {
  const {
    provincias,
    loading,
    getCantones,
    getParroquias,
    getLocationByParroquia,
  } = useLocations();

  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [cantones, setCantones] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [loadingCantones, setLoadingCantones] = useState(false);
  const [loadingParroquias, setLoadingParroquias] = useState(false);
  const [initializingLocation, setInitializingLocation] = useState(false);

  const hasInitialized = useRef(false);

  // ✅ INICIALIZACIÓN OPTIMIZADA CON 1 SOLA CONSULTA
  useEffect(() => {
    const initializeLocation = async () => {
      if (!initialValue || provincias.length === 0 || hasInitialized.current) {
        return;
      }

      hasInitialized.current = true;
      setInitializingLocation(true);

      try {
        // 🚀 UNA SOLA CONSULTA para obtener toda la ubicación
        const location = await getLocationByParroquia(initialValue);

        if (location) {
          // Cargar cantones de la provincia encontrada
          const cantonesData = await getCantones(location.provincia.id);
          setCantones(cantonesData);

          // Cargar parroquias del cantón encontrado
          const parroquiasData = await getParroquias(location.canton.id);
          setParroquias(parroquiasData);

          // Establecer los valores seleccionados
          setSelectedProvincia(location.provincia.id);
          setSelectedCanton(location.canton.id);

          console.log("✅ Ubicación inicializada:", {
            provincia: location.provincia.nombre,
            canton: location.canton.nombre,
            parroquia: location.parroquia.nombre,
          });
        }
      } catch (error) {
        console.error("❌ Error inicializando ubicación:", error);
        hasInitialized.current = false; // Permitir reintentar
      } finally {
        setInitializingLocation(false);
      }
    };

    initializeLocation();
  }, [
    initialValue,
    provincias,
    getCantones,
    getParroquias,
    getLocationByParroquia,
  ]);

  // Resetear la inicialización si cambia el initialValue
  useEffect(() => {
    if (initialValue !== value && initialValue) {
      hasInitialized.current = false;
    }
  }, [initialValue, value]);

  // ===== HANDLER: CAMBIO DE PROVINCIA =====
  const handleProvinciaChange = async (e) => {
    const provinciaId = e.target.value;

    setSelectedProvincia(provinciaId);
    setSelectedCanton("");
    setCantones([]);
    setParroquias([]);
    onChange("");

    if (provinciaId) {
      setLoadingCantones(true);
      try {
        const cantonesData = await getCantones(provinciaId);
        setCantones(cantonesData);
      } catch (error) {
        console.error("Error cargando cantones:", error);
      } finally {
        setLoadingCantones(false);
      }
    }
  };

  // ===== HANDLER: CAMBIO DE CANTÓN =====
  const handleCantonChange = async (e) => {
    const cantonId = e.target.value;

    setSelectedCanton(cantonId);
    setParroquias([]);
    onChange("");

    if (cantonId) {
      setLoadingParroquias(true);
      try {
        const parroquiasData = await getParroquias(cantonId);
        setParroquias(parroquiasData);
      } catch (error) {
        console.error("Error cargando parroquias:", error);
      } finally {
        setLoadingParroquias(false);
      }
    }
  };

  // ===== HANDLER: CAMBIO DE PARROQUIA =====
  const handleParroquiaChange = (e) => {
    onChange(e.target.value);
  };

  if (loading || initializingLocation) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-3 text-center py-4 text-text-secondary dark:text-background-light/70">
          <span className="material-symbols-outlined animate-spin">
            refresh
          </span>
          <p className="mt-2">
            {initializingLocation
              ? "Cargando ubicación del cliente..."
              : "Cargando ubicaciones..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* ===== PROVINCIA ===== */}
      <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-background-light/80 mb-2">
          Provincia {required && <span className="text-red-500">*</span>}
        </label>
        <select
          className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 px-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          value={selectedProvincia}
          onChange={handleProvinciaChange}
          disabled={disabled}
        >
          <option value="">Seleccionar provincia</option>
          {provincias.map((prov) => (
            <option key={prov.id_provincia} value={prov.id_provincia}>
              {prov.provincia}
            </option>
          ))}
        </select>
      </div>

      {/* ===== CANTÓN ===== */}
      <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-background-light/80 mb-2">
          Cantón {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 px-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            value={selectedCanton}
            onChange={handleCantonChange}
            disabled={disabled || cantones.length === 0 || loadingCantones}
          >
            <option value="">
              {loadingCantones ? "Cargando cantones..." : "Seleccionar cantón"}
            </option>
            {cantones.map((cant) => (
              <option key={cant.id_canton} value={cant.id_canton}>
                {cant.canton}
              </option>
            ))}
          </select>
          {loadingCantones && (
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary text-xl pointer-events-none">
              refresh
            </span>
          )}
        </div>
      </div>

      {/* ===== PARROQUIA ===== */}
      <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-background-light/80 mb-2">
          Parroquia {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            className={`w-full rounded-lg border ${
              error
                ? "border-red-500 focus:ring-red-500/20"
                : "border-primary/30 focus:ring-primary/20"
            } bg-white/50 py-2 px-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            value={value || ""}
            onChange={handleParroquiaChange}
            disabled={disabled || parroquias.length === 0 || loadingParroquias}
          >
            <option value="">
              {loadingParroquias
                ? "Cargando parroquias..."
                : "Seleccionar parroquia"}
            </option>
            {parroquias.map((parr) => (
              <option key={parr.id_parroquia} value={parr.id_parroquia}>
                {parr.parroquia}
              </option>
            ))}
          </select>
          {loadingParroquias && (
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary text-xl pointer-events-none">
              refresh
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
