import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ isCollapsed }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    // 1. Marcar como leída
    markRead(notification.id_notificacion);
    
    // 2. (Opcional) Navegar al inventario si es una alerta de stock
    // navigate('/admin/inventory'); 
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* --- BOTÓN CAMPANA --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors group ${
          isCollapsed ? "justify-center" : ""
        }`}
        title="Notificaciones"
      >
        <div className="relative">
          <span className={`material-symbols-outlined flex-shrink-0 transition-colors ${isOpen ? 'text-primary' : ''}`}>
            notifications
          </span>
          
          {/* Badge Rojo (Contador) */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        
        {/* Texto (Solo visible si el sidebar está expandido) */}
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
          }`}
        >
          Notificaciones
        </span>
      </button>

      {/* --- DROPDOWN FLOTANTE --- */}
      {isOpen && (
        <div
          className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-80 overflow-hidden flex flex-col
            ${
              isCollapsed
                ? "left-16 bottom-0 ml-4 origin-bottom-left" // Sidebar cerrado: flota a la derecha
                : "bottom-full left-0 mb-2 origin-bottom"    // Sidebar abierto: flota arriba
            }`}
        >
          {/* 1. Cabecera */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Notificaciones {unreadCount > 0 && <span className="text-primary ml-1">({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:text-primary-dark hover:underline transition-all"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* 2. Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center text-gray-400 flex flex-col items-center justify-center">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-full mb-3">
                    <span className="material-symbols-outlined text-2xl opacity-50">
                    notifications_paused
                    </span>
                </div>
                <p className="text-sm font-medium">Estás al día</p>
                <p className="text-xs mt-1 opacity-70">No hay nuevas alertas de stock</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                {notifications.map((notif) => (
                  <li
                    key={notif.id_notificacion}
                    className="group hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors cursor-default"
                  >
                    <div className="flex gap-3 p-4">
                      {/* Punto indicador visual */}
                      <div className="mt-1.5 flex-shrink-0">
                         <span className="block h-2 w-2 rounded-full bg-red-500 shadow-sm"></span>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug break-words">
                          {notif.mensaje}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">schedule</span>
                          {new Date(notif.fecha_creacion).toLocaleDateString()} • {new Date(notif.fecha_creacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>

                      {/* Botón Check Individual */}
                      <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                        }}
                        className="self-start text-gray-300 hover:text-primary transition-colors p-1 rounded-full hover:bg-primary/10 -mr-2 -mt-1"
                        title="Marcar como leída"
                      >
                        <span className="material-symbols-outlined text-xl">
                          check_circle
                        </span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;