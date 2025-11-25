import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LayoutContainer from "../components/Layout/LayoutContainer";
import LayoutContentContainer from "../components/Layout/LayoutContentContainer";
import LoginHeader from "../components/Login/LoginHeader";
import ErrorMessageCard from "../components/UI/ErrorMessageCard";
import LoginForm from "../components/Login/LoginForm";
import { ROLES } from "../constants/roles";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✨ Lógica de redirección centralizada y limpia
  const redirectUser = (userData) => {
    // Usamos el código, no el nombre que puede tener tildes o cambiar
    switch (userData.rol_codigo) {
      case ROLES.VENDEDOR:
        navigate("/seller");
        break;
      case ROLES.ADMINISTRADOR:
      case ROLES.SUPERUSUARIO:
      case ROLES.CONTADOR: // Asumiendo que contador va al admin panel
        navigate("/admin");
        break;
      default:
        // Si hay un rol nuevo desconocido, lo mandamos a home o mostramos error
        navigate("/");
    }
  };

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (credentials) => {
    setError(null);
    setLoading(true);

    try {
      const result = await login(credentials);

      if (result.success) {
        if (result.code === "FORCE_CHANGE_PASSWORD") {
          navigate("/update-password", {
            state: { tempToken: result.tempToken },
          });
        } else if (result.code === "LOGIN_SUCCESS") {
          // ✨ Usamos la función de redirección limpia
          redirectUser(result.usuario);
        }
      }
    } catch (error) {
      // Manejo de errores mejorado (Mantenemos tu lógica de mensajes)
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <LayoutContainer>
        <div className="flex flex-1 justify-center py-5">
          <LayoutContentContainer>
            <LoginHeader headline="Bienvenido al Sistema Integral de Gestión" />
            {error && (
              <ErrorMessageCard
                title="Error de autenticación"
                message={error}
                onClose={() => setError(null)} // Permitir cerrar el error
              />
            )}
            <LoginForm onLogin={handleLogin} loading={loading} />
          </LayoutContentContainer>
        </div>
      </LayoutContainer>
    </div>
  );
};

export default LoginPage;
