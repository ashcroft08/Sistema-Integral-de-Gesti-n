import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loginAttempts, setLoginAttempts] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Nuevo estado para controlar carga

  // ✅ NUEVA FUNCIÓN: Actualizar datos del usuario
  const refreshUser = async () => {
    try {
      const response = await api.get("/user-settings/profile");
      if (response.data.success) {
        const updatedUser = response.data.usuario;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error("Error al actualizar datos del usuario:", error);
      // Si hay error (como token expirado), hacer logout
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // ✅ SOLO UN useEffect PARA INICIALIZACIÓN
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          // Primero establecer datos del localStorage
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Luego actualizar con datos del backend
          await refreshUser();
        } catch (error) {
          console.error("Error inicializando autenticación:", error);
          // No hacer logout automático aquí para evitar loops
        }
      }

      setIsLoading(false); // ✅ Marcar que la inicialización terminó
    };

    initializeAuth();
  }, []); // ✅ Solo se ejecuta una vez al montar el componente

  const setAuthData = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
    setLoginAttempts(null);
  };

  // ✅ Función MEJORADA para manejar errores con información de intentos
  const handleApiError = (error) => {
    console.error("API Error:", error);

    // Si es error de validación Zod del backend
    if (error.response?.data?.error === "Datos de entrada inválidos") {
      const zodErrors = error.response.data.details;
      const errorMessage = zodErrors.map((err) => err.message).join(", ");
      return {
        message: errorMessage,
        attempts: null,
      };
    }

    // Si es error 401 en login - manejar información de intentos
    if (error.response?.status === 401) {
      const responseData = error.response?.data;

      // Verificar si el backend envía información de intentos
      if (responseData?.attemptsRemaining !== undefined) {
        const attempts = responseData.attemptsRemaining;
        let message = "Credenciales incorrectas.";

        if (attempts > 0) {
          message += ` Te quedan ${attempts} intento(s).`;
        } else {
          message += " Tu cuenta ha sido bloqueada temporalmente.";
        }

        return {
          message,
          attempts: attempts,
        };
      }

      // Si no hay información específica de intentos, usar mensaje genérico
      if (responseData?.message) {
        return {
          message: responseData.message,
          attempts: null,
        };
      }

      return {
        message:
          "Credenciales incorrectas. Por favor, verifica tu email y contraseña.",
        attempts: null,
      };
    }

    // Para otros errores de API
    const errorMessage =
      error.response?.data?.message || error.message || "Error en el servidor";
    return {
      message: errorMessage,
      attempts: null,
    };
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);

      if (data.success && data.code === "LOGIN_SUCCESS") {
        setAuthData(data.token, data.usuario);
        setLoginAttempts(null);
      }

      return data;
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.attempts !== null) {
        setLoginAttempts(handledError.attempts);
      }
      throw handledError;
    }
  };

  const completeFirstPasswordChange = async (
    tempToken,
    newPassword,
    confirmPassword
  ) => {
    try {
      const { data } = await api.post(
        "/auth/complete-password-change",
        {
          newPassword,
          confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${tempToken}` },
        }
      );

      if (data.success && data.code === "LOGIN_SUCCESS") {
        setAuthData(data.token, data.usuario);
        setLoginAttempts(null);
      }

      return data;
    } catch (error) {
      const handledError = handleApiError(error);
      throw handledError;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    } catch (error) {
      const handledError = handleApiError(error);
      throw handledError;
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return data;
    } catch (error) {
      const handledError = handleApiError(error);
      throw handledError;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setLoginAttempts(null);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loginAttempts,
    isLoading, // ✅ Exportar estado de carga
    login,
    logout,
    completeFirstPasswordChange,
    forgotPassword,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
