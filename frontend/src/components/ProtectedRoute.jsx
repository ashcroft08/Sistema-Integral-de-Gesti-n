// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Permitir a administradores acceder a cualquier vista mediante el selector de roles
  const isAdmin = user?.rol === 'Superusuario' || user?.id_rol === 1 || user?.rol === 'Administrador' || user?.id_rol === 2;
  
  if (isAdmin) {
    return children; // Los administradores pueden acceder a cualquier vista
  }

  // Para usuarios no administradores, verificar roles permitidos
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.rol))) {
    const roleRoutes = {
      Superusuario: "/admin",
      Administrador: "/admin",
      Vendedor: "/seller",
      Contador: "/admin",
    };

    const defaultRoute = roleRoutes[user?.rol] || "/admin";
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;