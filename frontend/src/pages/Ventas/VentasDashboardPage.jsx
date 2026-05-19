import React, { useState } from "react";
import ModuleLayout from "../../components/Layout/ModuleLayout";

const tabs = [
  { id: "pos", label: "Punto de Venta" },
  { id: "facturacion", label: "Facturación" },
  { id: "clientes", label: "Clientes" },
  { id: "cotizaciones", label: "Cotizaciones" },
  { id: "reportes", label: "Reportes" },
];

const quickActions = {
  pos: [
    { label: "Nueva Venta Rápida", icon: "bolt" },
    { label: "Abrir Caja", icon: "point_of_sale" },
    { label: "Cerrar Caja", icon: "lock" },
    { label: "Reimprimir Último Ticket", icon: "print" },
  ],
  facturacion: [
    { label: "Nueva Factura", icon: "receipt_long" },
    { label: "Nota de Crédito", icon: "assignment_return" },
    { label: "Consultar Documento", icon: "search" },
    { label: "Exportar a Excel", icon: "download" },
  ],
  clientes: [
    { label: "Nuevo Cliente", icon: "person_add" },
    { label: "Buscar Cliente", icon: "search" },
    { label: "Importar Clientes", icon: "upload_file" },
  ],
  cotizaciones: [
    { label: "Nueva Cotización", icon: "note_add" },
    { label: "Cotizaciones Pendientes", icon: "pending_actions" },
    { label: "Exportar Cotizaciones", icon: "download" },
  ],
  reportes: [
    { label: "Reporte Diario", icon: "today" },
    { label: "Reporte Mensual", icon: "calendar_month" },
    { label: "Exportar Reportes", icon: "download" },
  ],
};

const apps = {
  pos: [
    { label: "Caja Registradora", icon: "point_of_sale", color: "text-green-600 bg-green-500/10" },
    { label: "Ventas del Día", icon: "today", color: "text-blue-600 bg-blue-500/10" },
    { label: "Historial de Ventas", icon: "history", color: "text-purple-600 bg-purple-500/10" },
    { label: "Gestión de Pagos", icon: "payments", color: "text-amber-600 bg-amber-500/10" },
    { label: "Devoluciones", icon: "assignment_return", color: "text-rose-600 bg-rose-500/10" },
    { label: "Arqueo de Caja", icon: "calculate", color: "text-teal-600 bg-teal-500/10" },
  ],
  facturacion: [
    { label: "Emitir Factura", icon: "receipt_long", color: "text-green-600 bg-green-500/10" },
    { label: "Notas de Crédito", icon: "credit_card_off", color: "text-rose-600 bg-rose-500/10" },
    { label: "Notas de Débito", icon: "credit_score", color: "text-amber-600 bg-amber-500/10" },
    { label: "Comprobantes Electrónicos", icon: "cloud_upload", color: "text-blue-600 bg-blue-500/10" },
    { label: "Liquidaciones", icon: "summarize", color: "text-purple-600 bg-purple-500/10" },
    { label: "Retenciones", icon: "shield", color: "text-teal-600 bg-teal-500/10" },
  ],
  clientes: [
    { label: "Directorio de Clientes", icon: "contacts", color: "text-blue-600 bg-blue-500/10" },
    { label: "Cuentas por Cobrar", icon: "account_balance_wallet", color: "text-amber-600 bg-amber-500/10" },
    { label: "Historial de Compras", icon: "shopping_bag", color: "text-purple-600 bg-purple-500/10" },
    { label: "Créditos Otorgados", icon: "credit_card", color: "text-green-600 bg-green-500/10" },
    { label: "Reportes de Clientes", icon: "assessment", color: "text-teal-600 bg-teal-500/10" },
  ],
  cotizaciones: [
    { label: "Crear Cotización", icon: "note_add", color: "text-green-600 bg-green-500/10" },
    { label: "Cotizaciones Activas", icon: "pending_actions", color: "text-blue-600 bg-blue-500/10" },
    { label: "Cotizaciones Aprobadas", icon: "check_circle", color: "text-emerald-600 bg-emerald-500/10" },
    { label: "Cotizaciones Vencidas", icon: "schedule", color: "text-rose-600 bg-rose-500/10" },
    { label: "Convertir a Factura", icon: "swap_horiz", color: "text-amber-600 bg-amber-500/10" },
  ],
  reportes: [
    { label: "Ventas por Período", icon: "bar_chart", color: "text-blue-600 bg-blue-500/10" },
    { label: "Productos Más Vendidos", icon: "trending_up", color: "text-green-600 bg-green-500/10" },
    { label: "Rendimiento por Vendedor", icon: "person_search", color: "text-purple-600 bg-purple-500/10" },
    { label: "Análisis de Clientes", icon: "analytics", color: "text-teal-600 bg-teal-500/10" },
    { label: "Resumen Tributario", icon: "account_balance", color: "text-amber-600 bg-amber-500/10" },
    { label: "Dashboard de Ventas", icon: "dashboard", color: "text-rose-600 bg-rose-500/10" },
  ],
};

const VentasDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("pos");

  const currentQuickActions = quickActions[activeTab] || [];
  const currentApps = apps[activeTab] || [];

  return (
    <ModuleLayout moduleName="Módulo de Ventas" moduleIcon="shopping_cart">

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

export default VentasDashboardPage;
