// src/pages/SellerDashboardPage.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/Layout/AdminLayout";
import Sidebar from "../components/Admin/Sidebar";
import Button from "../components/UI/Button";

const SellerDashboardPage = () => {
  const { user } = useAuth();
  
  // Datos de ejemplo para la tabla
  const recentActivity = [
    {
      id: "#8B2A4",
      customer: "Elena Rodríguez",
      date: "2024-05-20",
      total: "$125.50",
      status: "Completado",
      statusColor:
        "bg-status-online/10 text-status-online dark:bg-status-online/20",
    },
    {
      id: "#8B2A3",
      customer: "Carlos Gomez",
      date: "2024-05-19",
      total: "$88.00",
      status: "Completado",
      statusColor:
        "bg-status-online/10 text-status-online dark:bg-status-online/20",
    },
    {
      id: "#8B2A2",
      customer: "Ana Torres",
      date: "2024-05-18",
      total: "$210.00",
      status: "Pendiente",
      statusColor:
        "bg-status-syncing/10 text-status-syncing dark:bg-status-syncing/20",
    },
  ];

  // Datos de ejemplo para las tarjetas
  const actionableCards = [
    {
      title: "Iniciar Nueva Venta",
      description: "Crea un nuevo pedido para un cliente.",
      icon: "add_shopping_cart",
      actionText: "Crear Pedido",
      actionLink: "#",
      stats: null, // No hay stats en esta tarjeta
    },
    {
      title: "Gestión de Clientes",
      description: "Ver, agregar o editar la información del cliente.",
      icon: "groups",
      actionText: "Ver Todos",
      actionLink: "#",
      stats: "Total Clientes: 42",
    },
    {
      title: "Ver Inventario",
      description: "Explora los niveles de stock y los detalles del producto.",
      icon: "inventory",
      actionText: "Explorar",
      actionLink: "#",
      stats: "Productos en stock: 150",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full font-display bg-background-light dark:bg-background-dark text-text-primary dark:text-background-light">
      <Sidebar role={user?.rol === 'Vendedor' ? 'seller' : 'admin'} />
      <main className="flex-1 p-8">
        <div className="flex flex-col max-w-7xl mx-auto gap-8">
          {/* Encabezado */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
                ¡Bienvenido, {user?.nombre || 'Usuario'}!
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
                Dashboard
              </p>
            </div>
            {/* Puedes agregar botones aquí si es necesario */}
          </div>

          {/* Tarjetas Accionables */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {actionableCards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-white/50 p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:bg-background-dark/50 dark:border-primary/30 dark:hover:bg-background-dark/80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    {card.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-text-primary dark:text-background-light">
                    {card.title}
                  </h3>
                  <p className="text-text-secondary dark:text-background-light/70">
                    {card.description}
                  </p>
                  {card.stats && (
                    <span className="font-mono text-sm text-text-primary dark:text-background-light/90">
                      {card.stats}
                    </span>
                  )}
                </div>
                <a
                  className="mt-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary w-fit"
                  href={card.actionLink}
                >
                  {card.actionText}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </a>
              </div>
            ))}
          </div>

          {/* Tabla de Actividad Reciente */}
          <div className="mt-4">
            <h2 className="font-heading text-2xl font-bold text-text-primary dark:text-background-light mb-4">
              Actividad Reciente
            </h2>
            <div className="overflow-x-auto rounded-lg border border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-primary/20 text-text-secondary dark:border-primary/30 dark:text-background-light/70">
                  <tr>
                    <th className="px-6 py-3 font-medium" scope="col">
                      ID Pedido
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Cliente
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Fecha
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Total
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-primary/20 dark:border-primary/30"
                    >
                      <td className="px-6 py-4 font-mono text-primary">
                        {activity.id}
                      </td>
                      <td className="px-6 py-4">{activity.customer}</td>
                      <td className="px-6 py-4">{activity.date}</td>
                      <td className="px-6 py-4">{activity.total}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${activity.statusColor}`}
                        >
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
