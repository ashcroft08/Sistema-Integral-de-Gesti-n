import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
// Importa el componente Loading (Ajusta la ruta si lo guardaste en otra carpeta)
import Loading from "./components/Loading/Loading"; 

const PublicRoute = () => {
  const { loading, isAuthenticated, user } = useAuth();

  // 1. Esperar carga inicial con el nuevo diseño
  if (loading) {
    return <Loading text="VERIFICANDO SESIÓN..." />;
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

  // 3. Si está autenticado pero aún no carga el usuario
  if (isAuthenticated && !user) {
    return <Loading text="REDIRECCIONANDO..." />;
  }

  // 4. Si no está autenticado, mostrar rutas públicas
  return <Outlet />;
};

export default PublicRoute;