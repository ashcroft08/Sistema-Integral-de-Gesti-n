import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Mientras carga, mostrar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700">
            Cargando sistema...
          </h1>
          <p className="text-gray-500">Por favor espere</p>
        </div>
      </div>
    );
  }

  // 2. Si no está autenticado, ir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Si está autenticado PERO no tenemos datos del usuario (esto no debería pasar)
  if (isAuthenticated && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700">
            Verificando permisos...
          </h1>
        </div>
      </div>
    );
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
