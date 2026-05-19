import React, { useState } from "react";
import ModuleLayout from "../../components/Layout/ModuleLayout";

const tabs = [
  { id: "inventario", label: "Inventario" },
  { id: "ingresos", label: "Ingresos" },
  { id: "egresos", label: "Egresos / Despachos" },
  { id: "proveedores", label: "Proveedores" },
  { id: "reportes", label: "Reportes" },
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
  reportes: [
    { label: "Reporte de Stock Actual", icon: "inventory_2" },
    { label: "Reporte de Movimientos", icon: "sync_alt" },
    { label: "Exportar Reportes", icon: "download" },
  ],
};

const apps = {
  inventario: [
    { label: "Catálogo de Productos", icon: "category", color: "text-amber-600 bg-amber-500/10" },
    { label: "Stock por Bodega", icon: "warehouse", color: "text-blue-600 bg-blue-500/10" },
    { label: "Kardex", icon: "list_alt", color: "text-purple-600 bg-purple-500/10" },
    { label: "Productos con Bajo Stock", icon: "warning", color: "text-rose-600 bg-rose-500/10" },
    { label: "Ubicaciones", icon: "location_on", color: "text-green-600 bg-green-500/10" },
    { label: "Unidades de Medida", icon: "straighten", color: "text-teal-600 bg-teal-500/10" },
  ],
  ingresos: [
    { label: "Recepción de Mercadería", icon: "local_shipping", color: "text-green-600 bg-green-500/10" },
    { label: "Órdenes de Compra", icon: "shopping_cart_checkout", color: "text-blue-600 bg-blue-500/10" },
    { label: "Inspección de Calidad", icon: "verified", color: "text-purple-600 bg-purple-500/10" },
    { label: "Ingresos por Devolución", icon: "assignment_return", color: "text-amber-600 bg-amber-500/10" },
    { label: "Historial de Ingresos", icon: "history", color: "text-teal-600 bg-teal-500/10" },
  ],
  egresos: [
    { label: "Despachos de Mercadería", icon: "outbox", color: "text-rose-600 bg-rose-500/10" },
    { label: "Guías de Remisión", icon: "description", color: "text-blue-600 bg-blue-500/10" },
    { label: "Transferencias", icon: "swap_horiz", color: "text-amber-600 bg-amber-500/10" },
    { label: "Bajas y Mermas", icon: "delete_sweep", color: "text-red-600 bg-red-500/10" },
    { label: "Historial de Egresos", icon: "history", color: "text-teal-600 bg-teal-500/10" },
    { label: "Seguimiento de Envíos", icon: "local_shipping", color: "text-green-600 bg-green-500/10" },
  ],
  proveedores: [
    { label: "Directorio de Proveedores", icon: "contacts", color: "text-blue-600 bg-blue-500/10" },
    { label: "Órdenes de Compra", icon: "receipt", color: "text-green-600 bg-green-500/10" },
    { label: "Cuentas por Pagar", icon: "account_balance_wallet", color: "text-amber-600 bg-amber-500/10" },
    { label: "Evaluación de Proveedores", icon: "star_rate", color: "text-purple-600 bg-purple-500/10" },
    { label: "Contratos Activos", icon: "handshake", color: "text-teal-600 bg-teal-500/10" },
  ],
  reportes: [
    { label: "Stock Valorizado", icon: "paid", color: "text-green-600 bg-green-500/10" },
    { label: "Movimientos por Período", icon: "bar_chart", color: "text-blue-600 bg-blue-500/10" },
    { label: "Rotación de Inventario", icon: "autorenew", color: "text-purple-600 bg-purple-500/10" },
    { label: "Productos Sin Movimiento", icon: "do_not_disturb", color: "text-rose-600 bg-rose-500/10" },
    { label: "Análisis de Compras", icon: "analytics", color: "text-teal-600 bg-teal-500/10" },
    { label: "Dashboard de Bodega", icon: "dashboard", color: "text-amber-600 bg-amber-500/10" },
  ],
};

const BodegaDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("inventario");

  const currentQuickActions = quickActions[activeTab] || [];
  const currentApps = apps[activeTab] || [];

  return (
    <ModuleLayout moduleName="Módulo de Bodega" moduleIcon="warehouse">

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-primary/20 dark:border-primary/30 mb-6 pb-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px rounded-t-lg ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5 dark:bg-primary/10 dark:text-background-light"
                : "border-transparent text-text-primary/60 hover:text-text-primary hover:bg-primary/5 dark:text-background-light/50 dark:hover:text-background-light dark:hover:bg-primary/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area: Quick Actions + Apps Grid */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Quick Actions Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="rounded-xl border border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-3 px-1">
              Acciones Rápidas
            </h3>
            <div className="flex flex-col gap-1">
              {currentQuickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-primary/80 dark:text-background-light/70 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors text-left group"
                >
                  <span className="material-symbols-outlined text-lg text-primary/60 group-hover:text-primary transition-colors">
                    {action.icon}
                  </span>
                  <span className="group-hover:text-text-primary dark:group-hover:text-background-light transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-4 px-1">
            Aplicaciones
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentApps.map((app, idx) => (
              <button
                key={idx}
                className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-primary/15 bg-white/60 dark:bg-background-dark/40 dark:border-primary/25 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.03] transition-all duration-200 cursor-pointer text-center min-h-[120px]"
              >
                <div className={`rounded-xl p-3 ${app.color} group-hover:scale-110 transition-transform duration-200`}>
                  <span className="material-symbols-outlined text-3xl">
                    {app.icon}
                  </span>
                </div>
                <span className="text-xs font-medium text-text-primary/80 dark:text-background-light/70 group-hover:text-text-primary dark:group-hover:text-background-light transition-colors leading-tight">
                  {app.label}
                </span>
              </button>
            ))}

            {/* Add New App Placeholder */}
            <button className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-primary/15 dark:border-primary/20 hover:border-primary/40 transition-all duration-200 cursor-pointer text-center min-h-[120px]">
              <div className="rounded-xl p-3 bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary/30 group-hover:text-primary/60 transition-colors">
                  add
                </span>
              </div>
              <span className="text-xs font-medium text-text-primary/30 dark:text-background-light/30 group-hover:text-text-primary/50 dark:group-hover:text-background-light/50 transition-colors">
                Próximamente
              </span>
            </button>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default BodegaDashboardPage;
