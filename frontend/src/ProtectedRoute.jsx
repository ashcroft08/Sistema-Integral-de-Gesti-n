import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
// Importa el componente Loading
import Loading from "./components/Loading/Loading";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Mientras carga, mostrar loading animado
  if (loading) {
    return <Loading text="CARGANDO SISTEMA..." />;
  }

  // 2. Si no está autenticado, ir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Si está autenticado PERO no tenemos datos del usuario
  if (isAuthenticated && !user) {
    return <Loading text="VERIFICANDO PERMISOS..." />;
  }

  // 4. Admin/Superusuario tienen acceso total
  const isAdmin = user?.rol === "Superusuario" || user?.rol === "Administrador";
  if (isAdmin) {
    return <Outlet />;
  }

  // 5. Validación de roles para usuarios normales
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    const roleRoutes = {
      Superusuario: "/admin",
      Administrador: "/admin",
      Vendedor: "/seller",
      Contador: "/admin",
    };

    const targetPath = roleRoutes[user.rol] || "/";

    // Evitar redirección si ya estamos en la ruta correcta
    if (location.pathname.startsWith(targetPath)) {
      return <Outlet />;
    }

    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;