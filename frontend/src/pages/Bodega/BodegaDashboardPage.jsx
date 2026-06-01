import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ModuleLayout from "../../components/Layout/ModuleLayout";
import { compraGeneralService } from "../../services/compraGeneral.service";
import ComprasGeneralesPage from "./Cacao/ComprasGeneralesPage";
import ResumenReportesPage from "./Cacao/ResumenReportesPage";

const tabs = [
  { id: "inventario", label: "Inventario", icon: "inventory_2" },
  { id: "materia-prima-cacao", label: "Materia Prima Cacao", icon: "eco" },
  { id: "ingresos", label: "Ingresos", icon: "arrow_circle_right" },
  { id: "egresos", label: "Egresos / Despachos", icon: "arrow_circle_left" },
  { id: "proveedores", label: "Proveedores", icon: "groups" },
  { id: "reportes", label: "Reportes", icon: "analytics" },
];

const quickActions = {
  inventario: [
    { label: "Conteo Rápido de Stock", icon: "inventory" },
    { label: "Ajuste de Inventario", icon: "tune" },
    { label: "Exportar Inventario", icon: "download" },
    { label: "Productos con Bajo Stock", icon: "warning" },
  ],
  ingresos: [
    { label: "Registrar Ingreso", icon: "add_box" },
    { label: "Ingreso por Orden de Compra", icon: "local_shipping" },
    { label: "Verificar Recepción", icon: "fact_check" },
    { label: "Importar desde Excel", icon: "upload_file" },
  ],
  egresos: [
    { label: "Nuevo Despacho", icon: "outbox" },
    { label: "Transferencia entre Bodegas", icon: "swap_horiz" },
    { label: "Generar Guía de Remisión", icon: "description" },
    { label: "Registrar Devolución", icon: "assignment_return" },
  ],
  proveedores: [
    { label: "Nuevo Proveedor", icon: "person_add" },
    { label: "Buscar Proveedor", icon: "search" },
    { label: "Nueva Orden de Compra", icon: "shopping_cart" },
    { label: "Importar Proveedores", icon: "upload_file" },
  ],
  "materia-prima-cacao": [
    { label: "Importar Compras Excel", icon: "upload_file", path: "/bodega/cacao/compras-generales" },
    { label: "Resumen Reportes DW", icon: "analytics", path: "/bodega/cacao/resumen-reportes" },
    { label: "Registrar Compra Interna", icon: "add_box" },
    { label: "Crear Lote de Cacao", icon: "layers" },
    { label: "Exportar Reporte MP", icon: "download" },
  ],
  reportes: [
    { label: "Reporte de Stock Actual", icon: "inventory_2" },
    { label: "Reporte de Movimientos", icon: "sync_alt" },
    { label: "Exportar Reportes", icon: "download" },
  ],
};

const BodegaDashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [comprasCount, setComprasCount] = useState(0);

  // Sync tab and sub-app states directly with URL query params
  const activeTab = searchParams.get("tab") || "inventario";
  const activeSubApp = searchParams.get("subApp") || null;

  // Sync count on mount and sub-app toggles
  const fetchCount = async () => {
    try {
      const res = await compraGeneralService.getAll(1, 1);
      if (res && res.total !== undefined) {
        setComprasCount(res.total);
      }
    } catch (err) {
      console.error("Error fetching compras count:", err);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [activeSubApp]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleActionClick = (path) => {
    if (path === "/bodega/cacao/compras-generales") {
      setSearchParams({ tab: activeTab, subApp: "compras-generales" });
    } else if (path === "/bodega/cacao/resumen-reportes") {
      setSearchParams({ tab: activeTab, subApp: "resumen-reportes" });
    } else if (path && path !== "#") {
      navigate(path);
    }
  };

  const apps = {
    inventario: [
      { label: "Catálogo de Productos", icon: "category", color: "text-amber-600 bg-amber-500/10", path: "#" },
      { label: "Stock por Bodega", icon: "warehouse", color: "text-blue-600 bg-blue-500/10", path: "#" },
      { label: "Kardex", icon: "list_alt", color: "text-purple-600 bg-purple-500/10", path: "#" },
      { label: "Alertas de Stock Bajo", icon: "warning", color: "text-rose-600 bg-rose-500/10", path: "#" },
      { label: "Ubicaciones Físicas", icon: "location_on", color: "text-green-600 bg-green-500/10", path: "#" },
      { label: "Unidades de Medida", icon: "straighten", color: "text-teal-600 bg-teal-500/10", path: "#" },
    ],
    ingresos: [
      { label: "Recepción de Mercadería", icon: "local_shipping", color: "text-green-600 bg-green-500/10", path: "#" },
      { label: "Órdenes de Compra", icon: "shopping_cart_checkout", color: "text-blue-600 bg-blue-500/10", path: "#" },
      { label: "Inspección de Calidad", icon: "verified", color: "text-purple-600 bg-purple-500/10", path: "#" },
      { label: "Ingresos por Devolución", icon: "assignment_return", color: "text-amber-600 bg-amber-500/10", path: "#" },
      { label: "Historial de Ingresos", icon: "history", color: "text-teal-600 bg-teal-500/10", path: "#" },
    ],
    egresos: [
      { label: "Despachos de Mercadería", icon: "outbox", color: "text-rose-600 bg-rose-500/10", path: "#" },
      { label: "Guías de Remisión", icon: "description", color: "text-blue-600 bg-blue-500/10", path: "#" },
      { label: "Transferencias Internas", icon: "swap_horiz", color: "text-amber-600 bg-amber-500/10", path: "#" },
      { label: "Bajas y Mermas", icon: "delete_sweep", color: "text-red-600 bg-red-500/10", path: "#" },
      { label: "Historial de Egresos", icon: "history", color: "text-teal-600 bg-teal-500/10", path: "#" },
    ],
    proveedores: [
      { label: "Directorio de Proveedores", icon: "contacts", color: "text-blue-600 bg-blue-500/10", path: "#" },
      { label: "Órdenes de Compra", icon: "receipt", color: "text-green-600 bg-green-500/10", path: "#" },
      { label: "Cuentas por Pagar", icon: "account_balance_wallet", color: "text-amber-600 bg-amber-500/10", path: "#" },
      { label: "Evaluación de Servicio", icon: "star_rate", color: "text-purple-600 bg-purple-500/10", path: "#" },
    ],
    "materia-prima-cacao": [
      { label: "Compras Generales", icon: "upload_file", color: "text-amber-700 bg-amber-500/10", path: "/bodega/cacao/compras-generales" },
      { label: "Resumen Reportes", icon: "analytics", color: "text-emerald-700 bg-emerald-500/10", path: "/bodega/cacao/resumen-reportes" },
      { label: "Compras Internas", icon: "inventory_2", color: "text-green-600 bg-green-500/10", path: "#" },
      { label: "Control Lotes Orgánicos", icon: "eco", color: "text-emerald-600 bg-emerald-500/10", path: "#" },
      { label: "Control Lotes Convencional", icon: "park", color: "text-teal-600 bg-teal-500/10", path: "#" },
      { label: "Comercialización", icon: "storefront", color: "text-blue-600 bg-blue-500/10", path: "#" },
      { label: "Proveedores MP", icon: "groups", color: "text-purple-600 bg-purple-500/10", path: "#" },
    ],
    reportes: [
      { label: "Stock Valorizado", icon: "paid", color: "text-green-600 bg-green-500/10", path: "#" },
      { label: "Movimientos por Período", icon: "bar_chart", color: "text-blue-600 bg-blue-500/10", path: "#" },
      { label: "Rotación de Inventario", icon: "autorenew", color: "text-purple-600 bg-purple-500/10", path: "#" },
      { label: "Productos Sin Movimiento", icon: "do_not_disturb", color: "text-rose-600 bg-rose-500/10", path: "#" },
      { label: "Análisis de Compras", icon: "analytics", color: "text-teal-600 bg-teal-500/10", path: "#" },
    ],
  };

  const currentQuickActions = quickActions[activeTab] || [];
  const currentApps = apps[activeTab] || [];

  return (
    <ModuleLayout moduleName="Módulo de Bodega" moduleIcon="warehouse">

      {/* Tab Navigation (Hidden when inside a sub-app) */}
      {!activeSubApp && (
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10 dark:border-primary/20 rounded-2xl mb-8 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25 dark:shadow-primary/10 scale-[1.02]"
                    : "text-text-primary/75 dark:text-background-light/70 hover:text-primary dark:hover:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10"
                }`}
              >
                <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isActive ? 'scale-110 rotate-[5deg]' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area: Scoped sub-app or normal Grid */}
      {activeTab === "materia-prima-cacao" && activeSubApp === "compras-generales" ? (
        <div className="animate-in fade-in-50 duration-300">
          <ComprasGeneralesPage onBack={() => setSearchParams({ tab: activeTab })} />
        </div>
      ) : activeTab === "materia-prima-cacao" && activeSubApp === "resumen-reportes" ? (
        <div className="animate-in fade-in-50 duration-300">
          <ResumenReportesPage onBack={() => setSearchParams({ tab: activeTab })} />
        </div>
      ) : (
        <div className="flex gap-8 flex-col lg:flex-row animate-in fade-in-50 duration-300">
          {/* Quick Actions Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="rounded-2xl border border-primary/15 bg-white/60 dark:bg-background-dark/45 dark:border-primary/25 backdrop-blur-md p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-background-light/60 mb-4 px-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">bolt</span>
                Acciones Rápidas
              </h3>
              <div className="flex flex-col gap-2">
                {currentQuickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionClick(action.path)}
                    disabled={!action.path}
                    className={`flex items-center gap-3 px-4 py-3 text-sm text-text-primary/80 dark:text-background-light/75 transition-all duration-200 text-left border border-transparent rounded-xl group ${
                      action.path
                        ? 'hover:bg-primary/5 dark:hover:bg-primary/15 hover:border-primary/10 dark:hover:border-primary/20 cursor-pointer'
                        : 'opacity-60 cursor-default'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary transition-colors ${action.path ? 'group-hover:bg-primary/15 dark:group-hover:bg-primary/20' : ''}`}>
                      <span className="material-symbols-outlined text-lg group-hover:scale-105 transition-transform">
                        {action.icon}
                      </span>
                    </div>
                    <span className={`font-medium transition-all duration-200 ${action.path ? 'group-hover:text-primary dark:group-hover:text-background-light group-hover:translate-x-0.5' : ''}`}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-background-light/60 mb-4 px-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">widgets</span>
              Aplicaciones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentApps.map((app, idx) => {
                const isInteractable = app.path && app.path !== "#";
                return (
                  <button
                    key={idx}
                    onClick={() => isInteractable && handleActionClick(app.path)}
                    disabled={!isInteractable}
                    className={`group relative flex flex-col items-center justify-center gap-4 p-5 rounded-2xl border aspect-square transition-all duration-300 ${
                      isInteractable
                        ? 'border-primary/15 bg-primary/[0.03] dark:bg-primary/[0.05] dark:border-primary/20 hover:bg-primary hover:border-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer'
                        : 'border-primary/5 bg-white/20 dark:bg-background-dark/20 dark:border-primary/10 opacity-40 cursor-default'
                    }`}
                  >
                    {/* Icon Container */}
                    <div className={`transition-all duration-300 ${isInteractable ? 'text-primary group-hover:text-white group-hover:scale-110' : 'text-text-primary/40 dark:text-background-light/40'}`}>
                      <span className="material-symbols-outlined text-4xl select-none">
                        {app.icon}
                      </span>
                    </div>

                    {/* Title */}
                    <span className={`text-xs font-bold transition-colors duration-300 leading-tight max-w-[130px] ${
                      isInteractable 
                        ? 'text-text-primary/95 dark:text-background-light/90 group-hover:text-white' 
                        : 'text-text-primary/40 dark:text-background-light/40'
                    }`}>
                      {app.label}
                    </span>
                  </button>
                );
              })}

              {/* Add New App Placeholder / Coming Soon */}
              <div className="group flex flex-col items-center justify-center gap-4 p-5 rounded-2xl border-2 border-dashed border-primary/15 dark:border-primary/25 bg-primary/[0.01] dark:bg-primary/[0.02] aspect-square text-center opacity-40">
                <div className="text-primary/40">
                  <span className="material-symbols-outlined text-4xl select-none">
                    add
                  </span>
                </div>
                <span className="text-xs font-bold text-text-primary/45 dark:text-background-light/45 leading-tight">
                  Próximamente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
};

export default BodegaDashboardPage;
