// src/components/Layout/ModuleLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/horizontal-sig-kallari.svg";
import favicon from "../../assets/favicon-sig-kallari.svg";

const getInitials = (fullName) => {
  if (!fullName) return "U";
  const names = fullName.trim().split(/\s+/);
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const ModuleLayout = ({ moduleName, moduleIcon, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showViewSubmenu, setShowViewSubmenu] = useState(false);

  const isAdmin =
    user?.rol_codigo === "ROL_SUPER" || user?.rol_codigo === "ROL_ADMIN";

  const getCurrentView = () => {
    const path = location.pathname;
    if (path.startsWith("/ventas")) return "ventas";
    if (path.startsWith("/bodega")) return "bodega";
    return "admin";
  };

  const currentView = getCurrentView();
  const userInitials = getInitials(user?.nombre);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowViewSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewChange = (view) => {
    setShowUserMenu(false);
    setShowViewSubmenu(false);
    navigate(view === "admin" ? "/admin" : `/${view}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate(`/${currentView}/profile`);
    setShowUserMenu(false);
  };

  const getViewDisplayName = (view) => {
    const views = { ventas: "Ventas", bodega: "Bodega", admin: "Administrador" };
    return views[view] || "Administrador";
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full font-display bg-background-light dark:bg-background-dark text-text-primary dark:text-background-light">
      {/* ═══════ TOP NAVBAR ═══════ */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-6 border-b border-primary/15 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        {/* Left: Logo + Module Name */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Kallari Logo"
            className="h-8 hidden sm:block cursor-pointer"
            onClick={() => navigate(`/${currentView}`)}
          />
          <img
            src={favicon}
            alt="Kallari"
            className="h-8 w-8 sm:hidden cursor-pointer"
            onClick={() => navigate(`/${currentView}`)}
          />
          <div className="h-6 w-px bg-primary/15 dark:bg-primary/25 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary/70">
              {moduleIcon}
            </span>
            <span className="text-sm font-semibold text-text-primary dark:text-background-light">
              {moduleName}
            </span>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowViewSubmenu(false);
            }}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
          >
            <div className="flex flex-col items-end mr-1 hidden sm:flex">
              <span className="text-xs font-semibold text-text-primary dark:text-background-light leading-tight">
                {user?.nombre || "Usuario"}
              </span>
              <span className="text-[10px] text-text-secondary dark:text-background-light/50 leading-tight">
                {getViewDisplayName(currentView)}
              </span>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center bg-primary/80 text-white dark:bg-primary/90 rounded-full size-8 shadow-sm">
              <span className="text-xs font-semibold">{userInitials}</span>
            </div>
            <span className="material-symbols-outlined text-sm text-text-secondary/60">
              {showUserMenu ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 w-56 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* User Info Header */}
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-semibold text-text-primary dark:text-background-light">
                  {user?.nombre || "Usuario"} {user?.apellido || ""}
                </p>
                <p className="text-xs text-text-secondary dark:text-background-light/50 truncate">
                  {user?.email || ""}
                </p>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 mb-1" />

              {/* Edit Profile */}
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-primary/70">
                  account_circle
                </span>
                Editar Perfil
              </button>

              {/* Change View (Admin only) */}
              {isAdmin && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2 my-1" />
                  <button
                    onClick={() => setShowViewSubmenu(!showViewSubmenu)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-primary dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg text-primary/70">
                        visibility
                      </span>
                      <span>Cambiar Vista</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-text-secondary">
                      {showViewSubmenu ? "expand_less" : "chevron_right"}
                    </span>
                  </button>

                  {showViewSubmenu && (
                    <div className="mx-2 mt-1 space-y-0.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1.5">
                      {["admin", "ventas", "bodega"].map((view) => (
                        <button
                          key={view}
                          onClick={() => handleViewChange(view)}
                          className={`w-full flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                            currentView === view
                              ? "bg-white dark:bg-gray-600 text-primary shadow-sm font-medium"
                              : "text-text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {view === "admin"
                              ? "admin_panel_settings"
                              : view === "ventas"
                              ? "shopping_cart"
                              : "warehouse"}
                          </span>
                          {view === "admin"
                            ? "Administrador"
                            : view === "ventas"
                            ? "Ventas"
                            : "Bodega"}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 my-1" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  logout
                </span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex flex-col max-w-[1400px] mx-auto gap-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModuleLayout;
