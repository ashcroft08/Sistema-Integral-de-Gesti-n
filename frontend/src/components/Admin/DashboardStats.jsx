// src/components/Admin/DashboardStats.jsx
import React, { useMemo } from "react";

const DashboardStats = ({ users = [], categories = [] }) => {
  const stats = useMemo(() => {
    const activeUsers = users.filter(u => u.id_estado_usuario === 1).length;
    const sellers = users.filter(u => u.Rol?.rol === 'Vendedor').length;
    const accountants = users.filter(u => u.Rol?.rol === 'Contador').length;
    const pendingFirstLogin = users.filter(u => u.primer_ingreso === true).length;
    
    // Estadísticas de categorías
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.id_estado_categoria === 1).length;
    const inactiveCategories = categories.filter(c => c.id_estado_categoria === 2).length;
    
    // Calcular usuarios nuevos este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = users.filter(u => {
      if (!u.createdAt) return false;
      const userDate = new Date(u.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;

    return [
      { 
        title: "Total de Usuarios", 
        value: users.length.toString(), 
        icon: "group",
        trend: newUsersThisMonth > 0 ? `+${newUsersThisMonth} este mes` : null,
        trendColor: "text-green-600 dark:text-green-400"
      },
      { 
        title: "Usuarios Activos", 
        value: activeUsers.toString(), 
        icon: "person_check",
        subtitle: `${Math.round((activeUsers / users.length) * 100) || 0}% del total`
      },
      { 
        title: "Vendedores", 
        value: sellers.toString(), 
        icon: "storefront" 
      },
      { 
        title: "Contadores", 
        value: accountants.toString(), 
        icon: "receipt_long" 
      },
      { 
        title: "Pendientes Primer Login", 
        value: pendingFirstLogin.toString(), 
        icon: "lock_reset",
        highlight: pendingFirstLogin > 0,
        highlightColor: "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10"
      },
      { 
        title: "Total Categorías", 
        value: totalCategories.toString(), 
        icon: "category" 
      },
      { 
        title: "Categorías Activas", 
        value: activeCategories.toString(), 
        icon: "check_circle",
        subtitle: inactiveCategories > 0 ? `${inactiveCategories} inactivas` : "Todas activas"
      },
    ];
  }, [users, categories]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`flex flex-col gap-2 rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
            stat.highlight 
              ? stat.highlightColor || "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10"
              : "border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary dark:text-background-light/70">
              {stat.title}
            </h3>
            <span className="material-symbols-outlined text-text-secondary/80 text-xl">
              {stat.icon}
            </span>
          </div>
          <p className="text-3xl font-bold text-text-primary dark:text-background-light">
            {stat.value}
          </p>
          {stat.trend && (
            <p className={`text-xs font-medium ${stat.trendColor || "text-text-secondary/60"}`}>
              {stat.trend}
            </p>
          )}
          {stat.subtitle && (
            <p className="text-xs text-text-secondary/60 dark:text-background-light/50">
              {stat.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
