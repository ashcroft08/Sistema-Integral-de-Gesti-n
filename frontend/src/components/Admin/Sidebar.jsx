import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin" },
    { id: "users", label: "Usuarios", icon: "manage_accounts", path: "/admin/users" },
    { id: "categories", label: "Categorías", icon: "category", path: "/admin/categories" },
    { id: "tokens", label: "Token", icon: "token", path: "/admin/tokens" },
    { id: "locks", label: "Bloqueo", icon: "lock_clock", path: "/admin/locks" },
    { id: "settings", label: "Configuración", icon: "settings", path: "/admin/settings" },
  ],
  seller: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/seller" },
    { id: "sales", label: "Ventas", icon: "shopping_cart", path: "/seller/sales" },
    { id: "clients", label: "Clientes", icon: "group", path: "/seller/clients" },
    { id: "inventory", label: "Inventario", icon: "inventory_2", path: "/seller/inventory" },
    { id: "settings", label: "Configuración", icon: "settings", path: "/seller/settings" },
  ],
  accountant: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/contador" },
    { id: "sales", label: "Ventas", icon: "shopping_cart", path: "/contador/sales" },
    { id: "reports", label: "Reportes", icon: "assessment", path: "/contador/reports" },
    { id: "clients", label: "Clientes", icon: "group", path: "/contador/clients" },
  ],
};

const getInitials = (fullName) => {
  if (!fullName) return "U";
  const names = fullName.trim().split(/\s+/);
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return sessionStorage.getItem("sidebarCollapsed") === "true";
  });
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("sidebarCollapsed", isCollapsed);
    // Cerrar el selector de roles si se pliega/despliega la barra para evitar bugs visuales
    setShowRoleSelector(false);
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleRoleSelector = () => setShowRoleSelector(!showRoleSelector);

  const getCurrentRole = () => {
    const path = location.pathname;
    if (path.startsWith("/seller")) return "seller";
    if (path.startsWith("/contador")) return "accountant";
    return "admin";
  };

  const currentRole = getCurrentRole();
  const items = menuItems[currentRole] || menuItems.admin;
  const userInitials = getInitials(user?.nombre);
  const isAdmin = user?.rol === 'Administrador' || user?.id_rol === 1;

  const handleRoleChange = (newRole) => {
    setShowRoleSelector(false);
    switch (newRole) {
      case "seller": navigate("/seller"); break;
      case "accountant": navigate("/contador"); break;
      case "admin": navigate("/admin"); break;
      default: navigate("/admin");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleDisplayName = (role) => {
    const roles = { seller: "Vendedor", accountant: "Contador", admin: "Administrador" };
    return roles[role] || "Administrador";
  };

  // Componente auxiliar para los botones del dropdown (DRY)
  const RoleButton = ({ role, icon, label }) => (
    <button
      onClick={() => handleRoleChange(role)}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors ${
        currentRole === role ? "bg-primary/20 text-primary" : "text-text-primary/80"
      }`}
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      <span className="block">{label}</span>
    </button>
  );

  return (
    <aside
      className={`flex h-screen flex-col justify-between border-r border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30 sticky top-0 transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* --- LOGO SECTION --- */}
        <div className={`flex h-16 items-center px-4 overflow-hidden ${isCollapsed ? "justify-center" : "justify-start"}`}>
            {/* Usamos un contenedor con ancho fijo para el logo para evitar saltos */}
            <div className={`relative flex items-center transition-all duration-300 ${isCollapsed ? "w-10" : "w-full"}`}>
               <img
                src={isCollapsed ? "/favicon-sig-kallari.webp" : "/horizontal-sig-kallari.webp"}
                alt="Kallari Logo"
                className={`object-contain transition-all duration-300 ${isCollapsed ? "h-14" : "h-14"}`}
              />
            </div>
        </div>

        {/* --- NAVIGATION --- */}
        <nav className="flex flex-col gap-2 px-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors overflow-hidden ${
                location.pathname === item.path ? "bg-primary/20 text-primary dark:bg-primary/30" : ""
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
              <p className={`text-sm font-medium leading-normal whitespace-nowrap transition-opacity duration-200 ${
                  isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto block"
                }`}
              >
                {item.label}
              </p>
            </Link>
          ))}
        </nav>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="flex flex-col gap-2 p-4">
        
        {/* Selector de Perfil - ADMINISTRADOR */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={toggleRoleSelector}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title="Cambiar perfil"
            >
              <span className="material-symbols-outlined flex-shrink-0">switch_account</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
                Cambiar Perfil
              </span>
            </button>

            {showRoleSelector && (
              /* OPTIMIZACIÓN CLAVE: 
                 Si está colapsado (w-20), el menú flota a la DERECHA (left-14) y tiene ancho fijo.
                 Si está abierto, flota ARRIBA (bottom-full) y tiene ancho completo (w-full).
              */
              <div className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1
                  ${isCollapsed 
                    ? "left-16 bottom-0 w-48 origin-bottom-left ml-2" 
                    : "bottom-full left-0 w-full mb-2 origin-bottom"
                  }`}
              >
                <RoleButton role="admin" icon="admin_panel_settings" label="Administrador" />
                <RoleButton role="seller" icon="person" label="Vendedor" />
                <RoleButton role="accountant" icon="calculate" label="Contador" />
              </div>
            )}
          </div>
        )}

        {/* Información del Usuario */}
        <div className={`flex items-center gap-3 border-t border-primary/20 pt-4 dark:border-primary/30 overflow-hidden ${isCollapsed ? "justify-center" : ""}`}>
          <div className="flex-shrink-0 flex items-center justify-center bg-primary/80 text-white dark:bg-primary/90 rounded-full size-10">
            <span className="text-sm font-semibold">{userInitials}</span>
          </div>
          <div className={`flex flex-col transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto block"}`}>
            <h2 className="text-base font-medium leading-normal text-text-primary dark:text-background-light whitespace-nowrap">
              {user?.nombre || "Usuario"}
            </h2>
            <p className="text-sm font-normal leading-normal text-text-secondary dark:text-background-light/70 whitespace-nowrap">
              {getRoleDisplayName(currentRole)}
            </p>
          </div>
        </div>

        {/* Botón Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Cerrar sesión" : undefined}
        >
          <span className="material-symbols-outlined flex-shrink-0">logout</span>
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
            Cerrar sesión
          </span>
        </button>

        {/* Toggle Sidebar */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Desplegar menú" : "Plegar menú"}
        >
          <span className="material-symbols-outlined flex-shrink-0">
            {isCollapsed ? "menu_open" : "chevron_left"}
          </span>
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
            {isCollapsed ? "Desplegar" : "Plegar"}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;