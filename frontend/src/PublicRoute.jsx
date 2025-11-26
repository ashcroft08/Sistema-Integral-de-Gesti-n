import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const PublicRoute = () => {
  const { loading, isAuthenticated, user } = useAuth();

  // 1. Esperar carga inicial
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  // 2. Si está autenticado Y tenemos datos del usuario, redirigir
  if (isAuthenticated && user) {
    const roleRoutes = {
      Superusuario: "/admin",
      Administrador: "/admin",
      Vendedor: "/seller",
      Contador: "/admin",
    };

    const destination = roleRoutes[user.rol] || "/admin";
    return <Navigate to={destination} replace />;
  }

  // 3. Si está autenticado pero aún no carga el usuario (esto no debería pasar)
  if (isAuthenticated && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-700">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // 4. Si no está autenticado, mostrar rutas públicas
  return <Outlet />;
};

export default PublicRoute;
