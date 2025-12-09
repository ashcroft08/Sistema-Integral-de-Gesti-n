import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ isCollapsed }) => {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    markRead(notification.id_notificacion);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- BOTÓN CAMPANA --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Mismos estilos base que los items del Sidebar
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-primary/80 hover:bg-primary/10 dark:text-background-light/80 dark:hover:bg-primary/20 rounded-lg transition-colors group outline-none ${
          isCollapsed ? "justify-center" : ""
        }`}
        title="Notificaciones"
      >
        <div className="relative flex items-center justify-center">
          {/* Icono del mismo tamaño que el sidebar (text-xl) */}
          <span
            className={`material-symbols-outlined flex-shrink-0 text-xl transition-colors ${
              isOpen ? "text-primary" : ""
            }`}
          >
            notifications
          </span>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900 animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>

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
          className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-80 overflow-hidden flex flex-col animation-fade-in
            ${
              isCollapsed
                ? "left-16 bottom-0 ml-4 origin-bottom-left"
                : "bottom-full left-0 mb-2 origin-bottom"
            }`}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
            <h3 className="text-sm font-bold text-text-primary dark:text-gray-100">
              Notificaciones{" "}
              {unreadCount > 0 && (
                <span className="text-primary ml-1">({unreadCount})</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:text-primary-dark hover:underline transition-all outline-none"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-text-secondary flex flex-col items-center justify-center">
                <div className="bg-primary/5 dark:bg-gray-700/50 p-4 rounded-full mb-3">
                  <span className="material-symbols-outlined text-3xl text-primary/40">
                    notifications_paused
                  </span>
                </div>
                <p className="text-sm font-medium">Estás al día</p>
                <p className="text-xs mt-1 opacity-70">No hay nuevas alertas</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                {notifications.map((notif) => (
                  <li
                    key={notif.id_notificacion}
                    // Hover unificado: bg-primary/5
                    className="group hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors cursor-default"
                  >
                    {/* Padding ajustado a p-3 para ser más compacto como el sidebar */}
                    <div className="flex gap-3 p-3">
                      <div className="mt-1.5 flex-shrink-0">
                        <span
                          className={`block h-2 w-2 rounded-full shadow-sm ${
                            notif.leida ? "bg-gray-300" : "bg-red-500"
                          }`}
                        ></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Tipografía corregida: text-text-primary y font-medium */}
                        <p
                          className={`text-sm leading-snug break-words ${
                            notif.leida
                              ? "text-text-secondary"
                              : "text-text-primary font-medium"
                          } dark:text-gray-200`}
                        >
                          {notif.mensaje}
                        </p>
                        <p className="text-[11px] text-text-secondary/70 mt-1 font-medium flex items-center gap-1">
                          {new Date(notif.fecha_creacion).toLocaleDateString()}{" "}
                          •{" "}
                          {new Date(notif.fecha_creacion).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notif);
                        }}
                        className="self-start text-text-secondary/50 hover:text-primary transition-colors p-1 rounded-full hover:bg-primary/10 -mr-1"
                        title="Marcar como leída"
                      >
                        <span className="material-symbols-outlined text-lg">
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
