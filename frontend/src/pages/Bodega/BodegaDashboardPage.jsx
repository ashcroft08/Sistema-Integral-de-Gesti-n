import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/Layout/ModuleLayout";
import { compraGeneralService } from "../../services/compraGeneral.service";

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
  const [activeTab, setActiveTab] = useState("inventario");
  const [comprasCount, setComprasCount] = useState(0);

  useEffect(() => {
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
    fetchCount();
  }, []);

  const apps = {
    inventario: [
      { label: "Catálogo de Productos", icon: "category", color: "text-amber-600 bg-amber-500/10", description: "Administración global de productos y SKUs de bodega", badge: "250 items", badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", path: "#" },
      { label: "Stock por Bodega", icon: "warehouse", color: "text-blue-600 bg-blue-500/10", description: "Visualización en tiempo real del stock y ubicaciones físicas", badge: "3 Bodegas", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", path: "#" },
      { label: "Kardex", icon: "list_alt", color: "text-purple-600 bg-purple-500/10", description: "Historial completo de movimientos de entrada y salida", badge: "Historial", badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", path: "#" },
      { label: "Alertas de Stock Bajo", icon: "warning", color: "text-rose-600 bg-rose-500/10", description: "Productos que requieren reabastecimiento urgente", badge: "4 Críticos", badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400", path: "#" },
      { label: "Ubicaciones Físicas", icon: "location_on", color: "text-green-600 bg-green-500/10", description: "Gestión de estanterías, pasillos y racks", badge: "12 zonas", badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", path: "#" },
      { label: "Unidades de Medida", icon: "straighten", color: "text-teal-600 bg-teal-500/10", description: "Configuración de unidades, libras, quintales y kg", badge: "6 unidades", badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400", path: "#" },
    ],
    ingresos: [
      { label: "Recepción de Mercadería", icon: "local_shipping", color: "text-green-600 bg-green-500/10", description: "Ingresos directos y verificación de facturas de compras", badge: "8 hoy", badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", path: "#" },
      { label: "Órdenes de Compra", icon: "shopping_cart_checkout", color: "text-blue-600 bg-blue-500/10", description: "Recepción basada en órdenes de compra autorizadas", badge: "3 pendientes", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", path: "#" },
      { label: "Inspección de Calidad", icon: "verified", color: "text-purple-600 bg-purple-500/10", description: "Control y aprobación de parámetros de humedad y merma", badge: "Calidad ok", badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", path: "#" },
      { label: "Ingresos por Devolución", icon: "assignment_return", color: "text-amber-600 bg-amber-500/10", description: "Procesamiento de mercadería devuelta por clientes", badge: "0 alertas", badgeColor: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", path: "#" },
      { label: "Historial de Ingresos", icon: "history", color: "text-teal-600 bg-teal-500/10", description: "Listado completo de actas de entrega-recepción pasadas", badge: "Histórico", badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400", path: "#" },
    ],
    egresos: [
      { label: "Despachos de Mercadería", icon: "outbox", color: "text-rose-600 bg-rose-500/10", description: "Despachos masivos y entrega de órdenes de salida", badge: "2 por despachar", badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400", path: "#" },
      { label: "Guías de Remisión", icon: "description", color: "text-blue-600 bg-blue-500/10", description: "Emisión y facturación electrónica de guías SRI", badge: "SRI Online", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", path: "#" },
      { label: "Transferencias Internas", icon: "swap_horiz", color: "text-amber-600 bg-amber-500/10", description: "Movimiento de stock entre bodegas Kallari", badge: "Tránsito seguro", badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", path: "#" },
      { label: "Bajas y Mermas", icon: "delete_sweep", color: "text-red-600 bg-red-500/10", description: "Registro de pérdidas, daños o mermas autorizadas", badge: "Control merma", badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", path: "#" },
      { label: "Historial de Egresos", icon: "history", color: "text-teal-600 bg-teal-500/10", description: "Registro y exportación de guías de despacho emitidas", badge: "Histórico", badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400", path: "#" },
    ],
    proveedores: [
      { label: "Directorio de Proveedores", icon: "contacts", color: "text-blue-600 bg-blue-500/10", description: "Listado de proveedores calificados y contactos de compras", badge: "45 proveedores", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", path: "#" },
      { label: "Órdenes de Compra", icon: "receipt", color: "text-green-600 bg-green-500/10", description: "Solicitudes y aprobación de órdenes de compra a proveedores", badge: "12 emitidas", badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", path: "#" },
      { label: "Cuentas por Pagar", icon: "account_balance_wallet", color: "text-amber-600 bg-amber-500/10", description: "Registro de facturas pendientes de pago a proveedores", badge: "Al día", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", path: "#" },
      { label: "Evaluación de Servicio", icon: "star_rate", color: "text-purple-600 bg-purple-500/10", description: "Calificación de tiempos de entrega y calidad de insumos", badge: "Promedio 4.8/5", badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", path: "#" },
    ],
    "materia-prima-cacao": [
      { 
        label: "Compras Generales", 
        icon: "upload_file", 
        color: "text-amber-700 bg-amber-500/10", 
        path: "/bodega/cacao/compras-generales", 
        description: "Importación masiva y ETL de compras externas (.xlsx)",
        badge: comprasCount > 0 ? `${comprasCount} registros` : "Sin datos",
        badgeColor: comprasCount > 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      },
      { label: "Compras Internas", icon: "inventory_2", color: "text-green-600 bg-green-500/10", description: "Registro y liquidación de compras a productores asociados", badge: "Registrar", badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", path: "#" },
      { label: "Control Lotes Orgánicos", icon: "eco", color: "text-emerald-600 bg-emerald-500/10", description: "Trazabilidad, fermentación y control de calidad orgánica", badge: "3 activos", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", path: "#" },
      { label: "Control Lotes Convencional", icon: "park", color: "text-teal-600 bg-teal-500/10", description: "Trazabilidad, secado y control de calidad convencional", badge: "Secado", badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400", path: "#" },
      { label: "Comercialización", icon: "storefront", color: "text-blue-600 bg-blue-500/10", description: "Ventas y despachos de lotes terminados de cacao", badge: "Kallari Store", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", path: "#" },
      { label: "Proveedores MP", icon: "groups", color: "text-purple-600 bg-purple-500/10", description: "Directorio de socios, productores y negociadores de cacao", badge: "Socio-Empresa", badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", path: "#" },
    ],
    reportes: [
      { label: "Stock Valorizado", icon: "paid", color: "text-green-600 bg-green-500/10", description: "Valorización de inventarios según costo promedio ponderado", badge: "Cálculo real", badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", path: "#" },
      { label: "Movimientos por Período", icon: "bar_chart", color: "text-blue-600 bg-blue-500/10", description: "Gráficos estadísticos de ingresos y egresos mensuales", badge: "Mensual", badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", path: "#" },
      { label: "Rotación de Inventario", icon: "autorenew", color: "text-purple-600 bg-purple-500/10", description: "Indicador de días de permanencia de stock en bodega", badge: "Alta rotación", badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", path: "#" },
      { label: "Productos Sin Movimiento", icon: "do_not_disturb", color: "text-rose-600 bg-rose-500/10", description: "Reporte de stock estancado o con baja rotación", badge: "0 críticos", badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", path: "#" },
      { label: "Análisis de Compras", icon: "analytics", color: "text-teal-600 bg-teal-500/10", description: "Tendencias de precios y volúmenes de compras mensuales", badge: "Estadísticas", badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400", path: "#" },
    ],
  };

  const currentQuickActions = quickActions[activeTab] || [];
  const currentApps = apps[activeTab] || [];

  return (
    <ModuleLayout moduleName="Módulo de Bodega" moduleIcon="warehouse">

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10 dark:border-primary/20 rounded-2xl mb-8 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Content Area: Quick Actions + Apps Grid */}
      <div className="flex gap-8 flex-col lg:flex-row">
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
                  onClick={() => action.path && navigate(action.path)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentApps.map((app, idx) => {
              const isInteractable = app.path && app.path !== "#";
              return (
                <button
                  key={idx}
                  onClick={() => isInteractable && navigate(app.path)}
                  disabled={!isInteractable}
                  className={`group relative flex flex-col justify-between p-6 rounded-2xl border bg-white/60 dark:bg-background-dark/40 backdrop-blur-md transition-all duration-300 min-h-[175px] text-left ${
                    isInteractable
                      ? 'border-primary/15 dark:border-primary/25 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02] cursor-pointer'
                      : 'border-primary/5 dark:border-primary/10 opacity-75 cursor-default'
                  }`}
                >
                  <div>
                    {/* Top Bar with Icon and Optional Badge */}
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className={`rounded-xl p-2.5 ${app.color} group-hover:scale-105 transition-transform duration-255`}>
                        <span className="material-symbols-outlined text-2xl">
                          {app.icon}
                        </span>
                      </div>
                      {app.badge && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${app.badgeColor}`}>
                          {app.badge}
                        </span>
                      )}
                    </div>

                    {/* Title and Description */}
                    <h4 className="text-sm font-bold text-text-primary dark:text-background-light mb-1.5 group-hover:text-primary dark:group-hover:text-background-light transition-colors leading-tight">
                      {app.label}
                    </h4>
                    <p className="text-xs text-text-secondary dark:text-background-light/45 leading-relaxed line-clamp-2">
                      {app.description || 'Módulo interactivo para gestión y visualización de datos.'}
                    </p>
                  </div>

                  {/* Bottom interactive link */}
                  <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-primary/5 dark:border-primary/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 group-hover:text-primary dark:text-background-light/50 dark:group-hover:text-background-light transition-colors">
                      {isInteractable ? 'Acceder al módulo' : 'Módulo en desarrollo'}
                    </span>
                    {isInteractable && (
                      <span className="material-symbols-outlined text-base text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200">
                        arrow_forward
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Add New App Placeholder / Coming Soon */}
            <div className="group relative flex flex-col justify-between p-6 rounded-2xl border-2 border-dashed border-primary/15 dark:border-primary/20 bg-primary/[0.01] dark:bg-primary/[0.02] min-h-[175px] text-left opacity-60">
              <div>
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="rounded-xl p-2.5 bg-primary/5 dark:bg-primary/10 text-primary/40">
                    <span className="material-symbols-outlined text-2xl">
                      add_circle
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold bg-primary/5 text-primary/50 px-2 py-0.5 rounded-full">
                    Próximamente
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-primary/40 dark:text-background-light/40 mb-1.5 leading-tight">
                  Nuevo Módulo
                </h4>
                <p className="text-xs text-text-secondary/40 dark:text-background-light/20 leading-relaxed">
                  Estamos diseñando nuevas aplicaciones para expandir las capacidades del módulo de bodega.
                </p>
              </div>
              <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-primary/5 dark:border-primary/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-primary/20 dark:text-background-light/20">
                  En desarrollo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
};

export default BodegaDashboardPage;
