// src/components/RoleBasedRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Mapeo de roles del backend a las rutas del frontend
  const roleMap = {
    Superusuario: "/admin",
    Administrador: "/admin",
    Vendedor: "/seller",
    Contador: "/admin",
  };

  const defaultRoute = roleMap[user.rol] || "/admin";

  return <Navigate to={defaultRoute} replace />;
};

export default RoleBasedRedirect;
