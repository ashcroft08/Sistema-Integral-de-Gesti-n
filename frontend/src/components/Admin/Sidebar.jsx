import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/horizontal-sig-kallari.svg";
import favicon from "../../assets/favicon-sig-kallari.svg";
import NotificationBell from "../../components/ui/NotificationBell.jsx";

const menuItems = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin" },
    {
      id: "users",
      label: "Usuarios",
      icon: "manage_accounts",
      path: "/admin/users",
    },
    { id: "tokens", label: "Token", icon: "token", path: "/admin/tokens" },
    { id: "locks", label: "Bloqueo", icon: "lock_clock", path: "/admin/locks" },
    {
      id: "taxes",
      label: "Impuestos (IVA)",
      icon: "percent",
      path: "/admin/taxes",
    },
    {
      id: "discounts",
      label: "Descuentos",
      icon: "sell",
      path: "/admin/discounts",
    },
    {
      id: "certificate",
      label: "Certificado Digital",
      icon: "license",
      path: "/admin/certificate",
    },
  ],
  seller: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/seller" },
    {
      id: "sales",
      label: "Punto de Venta",
      icon: "shopping_cart",
      path: "/seller/sales",
    },
    {
      id: "clients",
      label: "Clientes",
      icon: "group",
      path: "/seller/clients",
    },
        {
      id: "invoices",
      label: "Facturas",
      icon: "receipt_long",
      path: "/seller/invoices",
    },
    {
      id: "categories",
      label: "Categorías",
      icon: "category",
      path: "/seller/categories",
      adminOnly: true,
    },
    {
      id: "inventory",
      label: "Inventario",
      icon: "inventory_2",
      path: "/seller/inventory",
    },
  ],
  accountant: [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      path: "/contador",
    },
    {
      id: "sales",
      label: "Ventas",
      icon: "shopping_cart",
      path: "/contador/sales",
    },
    {
      id: "reports",
      label: "Reportes",
      icon: "assessment",
      path: "/contador/reports",
    },
    {
      id: "clients",
      label: "Clientes",
      icon: "group",
      path: "/contador/clients",
    },
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
  const userMenuRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return sessionStorage.getItem("sidebarCollapsed") === "true";
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("sidebarCollapsed", isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowRoleSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowRoleSubmenu(false);
  };

  const getCurrentRole = () => {
    const path = location.pathname;
    if (path.startsWith("/seller")) return "seller";
    if (path.startsWith("/contador")) return "accountant";
    return "admin";
  };

  const currentRole = getCurrentRole();
  const isAdmin =
    user?.rol_codigo === "ROL_SUPER" || user?.rol_codigo === "ROL_ADMIN";

  const allItems = menuItems[currentRole] || menuItems.admin;
  const items = allItems.filter((item) => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  const userInitials = getInitials(user?.nombre);

  const handleRoleChange = (newRole) => {
    setShowUserMenu(false);
    switch (newRole) {
      case "seller":
        navigate("/seller");
        break;
      case "accountant":
        navigate("/contador");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/admin");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    const basePath =
      currentRole === "admin"
        ? "/admin"
        : currentRole === "seller"
        ? "/seller"
        : "/contador";
    navigate(`${basePath}/profile`);
    setShowUserMenu(false);
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      seller: "Vendedor",
      accountant: "Contador",
      admin: "Administrador",
    };
    return roles[role] || "Administrador";
  };

  // Clase común para items del menú desplegable para asegurar consistencia
  const dropdownItemClass =
    "w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-gray-700 rounded-lg transition-colors";

  return (
    <aside
      className={`flex h-screen flex-col border-r border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30 sticky top-0 transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* --- LOGO SECTION --- */}
      <div
        className={`flex h-16 flex-shrink-0 items-center px-4 overflow-hidden ${
          isCollapsed ? "justify-center" : "justify-start"
        }`}
      >
        <div
          className={`relative flex items-center transition-all duration-300 ${
            isCollapsed ? "w-10 justify-center" : "w-full justify-start"
          }`}
        >
          <img
            src={isCollapsed ? favicon : logo}
            alt="Kallari Logo"
            // CAMBIO AQUÍ:
            // Si está colapsado (favicon), usamos h-10 (40px) para que no se vea gigante.
            // Si está desplegado (logo completo), usamos h-12 o h-14 para que el texto sea legible.
            className={`object-contain transition-all duration-300 ${
              isCollapsed ? "h-10 w-10" : "h-12"
            }`}
          />
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 custom-scrollbar">
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors overflow-hidden flex-shrink-0 ${
                location.pathname === item.path
                  ? "bg-primary/20 text-primary dark:bg-primary/30 font-medium"
                  : "font-medium"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined flex-shrink-0 text-xl">
                {item.icon}
              </span>
              <p
                className={`text-sm leading-normal whitespace-nowrap transition-all duration-300 origin-left ${
                  isCollapsed
                    ? "opacity-0 w-0 translate-x-[-10px]"
                    : "opacity-100 w-auto translate-x-0"
                }`}
              >
                {item.label}
              </p>
            </Link>
          ))}
        </nav>
      </div>

      {/* --- FOOTER (USER MENU) --- */}
      <div className="flex flex-col gap-2 p-4 flex-shrink-0 border-t border-primary/10">
        <NotificationBell isCollapsed={isCollapsed} />

        {/* CONTENEDOR DEL MENÚ DE USUARIO */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            // CORRECCIÓN: Usar hover:bg-primary/10 en lugar de gray-100 para consistencia
            className={`w-full flex items-center py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors overflow-hidden outline-none ${
              isCollapsed ? "justify-center gap-0" : "gap-3 px-2"
            }`}
          >
            <div className="flex-shrink-0 flex items-center justify-center bg-primary/80 text-white dark:bg-primary/90 rounded-full size-9 shadow-sm">
              <span className="text-sm font-semibold">{userInitials}</span>
            </div>

            <div
              className={`flex flex-col items-start transition-all duration-200 ${
                isCollapsed
                  ? "opacity-0 w-0 hidden"
                  : "opacity-100 w-auto block"
              }`}
            >
              <h2 className="text-sm font-bold text-text-primary dark:text-background-light whitespace-nowrap">
                {user?.nombre || "Usuario"}
              </h2>
              <p className="text-xs text-text-secondary dark:text-background-light/70 whitespace-nowrap">
                {getRoleDisplayName(currentRole)}
              </p>
            </div>
            {!isCollapsed && (
              <span className="material-symbols-outlined text-text-secondary/60 text-sm ml-auto">
                {showUserMenu ? "expand_less" : "expand_more"}
              </span>
            )}
          </button>

          {/* --- MENÚ DESPLEGABLE --- */}
          {showUserMenu && (
            <div
              className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 w-60 animation-fade-in
                ${
                  isCollapsed
                    ? "left-14 bottom-0 ml-2 origin-bottom-left"
                    : "bottom-[110%] left-0 w-full mb-1 origin-bottom"
                }`}
            >
              <button
                onClick={handleProfileClick}
                className={dropdownItemClass}
              >
                <span className="material-symbols-outlined text-xl text-primary/80">
                  account_circle
                </span>
                Editar Perfil
              </button>

              {isAdmin && (
                <div className="border-t border-gray-100 dark:border-gray-700 my-1 pt-1">
                  <button
                    onClick={() => setShowRoleSubmenu(!showRoleSubmenu)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-primary dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-primary/80">
                        switch_account
                      </span>
                      <span>Cambiar Rol</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-text-secondary">
                      {showRoleSubmenu ? "expand_less" : "chevron_right"}
                    </span>
                  </button>

                  {showRoleSubmenu && (
                    <div className="pl-4 mt-1 space-y-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      {["admin", "seller", "accountant"].map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${
                            currentRole === role
                              ? "bg-white text-primary shadow-sm font-medium"
                              : "text-text-secondary hover:text-primary hover:bg-gray-100"
                          }`}
                        >
                          {role === "admin"
                            ? "Administrador"
                            : role === "seller"
                            ? "Vendedor"
                            : "Contador"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  logout
                </span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors mt-1 outline-none ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Desplegar menú" : "Plegar menú"}
        >
          <span className="material-symbols-outlined flex-shrink-0 text-xl">
            {isCollapsed ? "menu_open" : "chevron_left"}
          </span>
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            {isCollapsed ? "Desplegar" : "Plegar"}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
