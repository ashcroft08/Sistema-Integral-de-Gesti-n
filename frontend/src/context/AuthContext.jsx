import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Función MEJORADA para obtener datos del usuario autenticado
  const refreshUser = async () => {
    try {
      const response = await axiosInstance.get("/auth/me");

      if (response.data.success) {
        const userData = response.data.usuario;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error("No se pudieron obtener los datos del usuario");
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);

      // Si hay error 401, limpiamos todo
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // ✅ useEffect MEJORADO para inicialización - CRÍTICO: Asegurar que isLoading siempre se establezca en false
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      try {
        if (storedToken) {
          // 1. Configurar token para las siguientes peticiones
          setToken(storedToken);

          // 2. Usar datos cacheados SOLO como fallback temporal
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            } catch (e) {
              console.error("Error parsing stored user:", e);
              localStorage.removeItem("user");
            }
          }

          // 3. Validar token y cargar usuario real desde backend
          await refreshUser();
        } else {
          // No hay token, aseguramos estado limpio
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error en inicialización de auth:", error);
        // Si falla la validación, limpiamos todo
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        // ✅ CRÍTICO: Siempre establecer loading en false, sin importar qué pase
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setAuthData = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
    setLoginAttempts(null);
  };

  // ✅ Función MEJORADA para manejar errores
  const handleApiError = (error) => {
    console.error("API Error:", error);

    // Validación Zod
    if (error.response?.data?.error === "Datos de entrada inválidos") {
      const zodErrors = error.response.data.details;
      const errorMessage = Array.isArray(zodErrors)
        ? zodErrors.map((err) => err.message).join(", ")
        : "Datos inválidos";
      return { message: errorMessage, attempts: null };
    }

    // Error 401 (Credenciales)
    if (error.response?.status === 401) {
      const responseData = error.response?.data;
      if (responseData?.attemptsRemaining !== undefined) {
        const attempts = responseData.attemptsRemaining;
        let message = "Credenciales incorrectas.";
        if (attempts > 0) {
          message += ` Te quedan ${attempts} intento(s).`;
        } else {
          message += " Tu cuenta ha sido bloqueada temporalmente.";
        }
        return { message, attempts: attempts };
      }
      if (responseData?.message) {
        return { message: responseData.message, attempts: null };
      }
      return { message: "Credenciales incorrectas.", attempts: null };
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Error en el servidor";
    return { message: errorMessage, attempts: null };
  };

  const login = async (credentials) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", credentials);
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
      const { data } = await axiosInstance.post(
        "/auth/complete-password-change",
        { newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      if (data.success && data.code === "LOGIN_SUCCESS") {
        setAuthData(data.token, data.usuario);
        setLoginAttempts(null);
      }
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const { data } = await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setLoginAttempts(null);
    // ❌ NO establecer isLoading aquí para evitar bucles
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loginAttempts,
    loading: isLoading,
    login,
    logout,
    completeFirstPasswordChange,
    forgotPassword,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
