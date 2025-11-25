// src/pages/UpdatePasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import LayoutContainer from "../components/Layout/LayoutContainer";
import LayoutContentContainer from "../components/Layout/LayoutContentContainer";
import PasswordInput from "../components/UI/PasswordInput";
import Button from "../components/UI/Button";
import ErrorMessageCard from "../components/UI/ErrorMessageCard";
import { ChangePasswordWithConfirmationSchema } from "../schemas/auth.schemas";
import {
  calculatePasswordStrength as calcStrength,
  getPasswordRequirements,
} from "../utils/passwordValidator";

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeFirstPasswordChange, user } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(ChangePasswordWithConfirmationSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  // Obtener el tempToken de la navegación o del localStorage
  useEffect(() => {
    const token =
      location.state?.tempToken || localStorage.getItem("tempToken");
    if (token) {
      setTempToken(token);
      localStorage.setItem("tempToken", token);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  // Si el usuario ya cambió la contraseña, redirigir
  useEffect(() => {
    if (user && !tempToken) {
      if (user.rol === "Vendedor") {
        navigate("/seller");
      } else {
        navigate("/admin");
      }
    }
  }, [user, tempToken, navigate]);

  // Calcular fortaleza de contraseña en tiempo real
  useEffect(() => {
    if (newPasswordValue) {
      const strength = calcStrength(newPasswordValue);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPasswordValue]);

  // Función para verificar los requisitos de la contraseña
  const checkPasswordRequirements = (password) => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };
  };

  // src/pages/UpdatePasswordPage.jsx
  const handleUpdatePassword = async (data) => {
    setError(null);
    setLoading(true);

    try {
      const result = await completeFirstPasswordChange(
        tempToken,
        data.newPassword,
        data.confirmPassword // ✅ AÑADIR confirmPassword
      );

      if (result.success && result.code === "LOGIN_SUCCESS") {
        localStorage.removeItem("tempToken");
        if (result.usuario.rol === "Vendedor") {
          navigate("/seller");
        } else {
          navigate("/admin");
        }
      }
    } catch (error) {
      setError(error.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Mapeo de fortaleza a texto y ancho de barra
  const strengthLabels = [
    "Muy Débil",
    "Débil",
    "Medio",
    "Fuerte",
    "Muy Fuerte",
  ];
  const strengthWidths = ["0%", "25%", "50%", "75%", "100%"];
  const strengthColors = [
    "bg-red-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-accent-success",
  ];

  // Obtener el estado de los requisitos
  const requirements = checkPasswordRequirements(newPasswordValue || "");
  const requirementKeys = [
    "minLength",
    "hasUpperCase",
    "hasLowerCase",
    "hasNumber",
    "hasSpecialChar",
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <LayoutContainer>
        <div className="flex flex-1 justify-center py-5">
          <LayoutContentContainer>
            {/* Header */}
            <div className="flex flex-col items-center">
              <div className="flex justify-center items-center py-8">
                <img
                  src="/imagotipo-sig-kallari.webp"
                  alt="Kallari Logo"
                  className="h-24 w-auto"
                />
              </div>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark mb-3">
                  Actualizar Contraseña
                </h1>
                <p className="text-text-light/80 dark:text-text-dark/80 text-base">
                  Por favor, establece tu nueva contraseña
                </p>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 max-w-md mx-auto w-full">
                <ErrorMessageCard title="Error" message={error} />
              </div>
            )}

            {/* Formulario CON DOS CAMPOS */}
            <form
              onSubmit={handleSubmit(handleUpdatePassword)}
              className="flex w-full flex-col gap-6 max-w-md mx-auto"
            >
              {/* Campo de Nueva Contraseña */}
              <div className="space-y-3">
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                    Nueva Contraseña
                  </p>
                  <PasswordInput
                    placeholder="Ingresa tu nueva contraseña"
                    error={errors.newPassword?.message}
                    required
                    disabled={loading}
                    {...register("newPassword")}
                    containerClassName="focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                    inputClassName="p-3 h-12"
                  />
                </label>

                {/* Password Requirements Card */}
                {newPasswordValue && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                    <p className="text-sm font-medium text-text-light dark:text-text-dark mb-3">
                      Requisitos de contraseña:
                    </p>
                    <div className="space-y-2">
                      {getPasswordRequirements().map((req, idx) => {
                        const isRequirementMet =
                          requirements[requirementKeys[idx]];

                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <span
                              className={`material-symbols-outlined text-sm ${
                                isRequirementMet
                                  ? "text-accent-success"
                                  : "text-red-500"
                              }`}
                            >
                              {isRequirementMet
                                ? "check_circle"
                                : "radio_button_unchecked"}
                            </span>
                            <span
                              className={`text-sm ${
                                isRequirementMet
                                  ? "text-accent-success font-medium"
                                  : "text-placeholder-light dark:text-placeholder-dark"
                              }`}
                            >
                              {req}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Password Strength Indicator */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                      Fortaleza de la contraseña
                    </p>
                    <p className="text-xs font-medium text-placeholder-light dark:text-placeholder-dark">
                      {passwordStrength > 0
                        ? strengthLabels[passwordStrength - 1]
                        : strengthLabels[0]}
                    </p>
                  </div>
                  <div className="w-full rounded-full bg-border-light/50 dark:bg-border-dark/50 h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength > 0
                          ? strengthColors[passwordStrength - 1]
                          : "bg-gray-300"
                      }`}
                      style={{
                        width:
                          passwordStrength > 0
                            ? strengthWidths[passwordStrength - 1]
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* ✅ CAMPO DE CONFIRMACIÓN AÑADIDO - ESTE ES EL QUE FALTABA */}
              <div className="space-y-3">
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                    Confirmar Nueva Contraseña
                  </p>
                  <PasswordInput
                    placeholder="Confirma tu nueva contraseña"
                    error={errors.confirmPassword?.message}
                    required
                    disabled={loading}
                    {...register("confirmPassword")}
                    containerClassName="focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                    inputClassName="p-3 h-12"
                  />
                </label>
              </div>

              {/* Botón de Guardar Cambios */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="h-12 w-full"
                  disabled={loading || !isValid || !isDirty}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-base">
                        refresh
                      </span>
                      Actualizando...
                    </div>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>

            {/* Información adicional */}
            <div className="text-center py-6 max-w-md mx-auto">
              <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                Esta es tu primera vez iniciando sesión. Debes establecer una
                nueva contraseña para continuar.
              </p>
            </div>
          </LayoutContentContainer>
        </div>
      </LayoutContainer>
    </div>
  );
};

export default UpdatePasswordPage;
