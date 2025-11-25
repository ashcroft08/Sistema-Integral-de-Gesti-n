// src/pages/CreateNewPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import LayoutContainer from "../components/Layout/LayoutContainer";
import LayoutContentContainer from "../components/Layout/LayoutContentContainer";
import PasswordInput from "../components/UI/PasswordInput";
import Button from "../components/UI/Button";
import ErrorMessageCard from "../components/UI/ErrorMessageCard";
// ✅ CAMBIAR A ResetPasswordWithConfirmationSchema
import { ResetPasswordWithConfirmationSchema } from "../schemas/auth.schemas";
import {
  calculatePasswordStrength as calcStrength,
  getPasswordRequirements,
} from "../utils/passwordValidator";

const CreateNewPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    setValue,
  } = useForm({
    // ✅ USAR EL SCHEMA CORRECTO
    resolver: zodResolver(ResetPasswordWithConfirmationSchema),
    mode: "onChange",
    defaultValues: {
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  // Validar que hay token
  useEffect(() => {
    if (!token) {
      setError(
        "Token no válido. Por favor solicita un nuevo enlace de recuperación."
      );
    } else {
      setValue("token", token);
    }
  }, [token, setValue]);

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

  const handleFormSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      // ✅ Enviar token, newPassword Y confirmPassword
      const result = await resetPassword(
        data.token,
        data.newPassword,
        data.confirmPassword
      );
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setError(error.message || "Error al restablecer la contraseña");
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
    <LayoutContainer>
      <div className="flex flex-1 justify-center py-5">
        <LayoutContentContainer>
          {/* Header/Logo */}
          <div className="flex flex-col items-center gap-2 py-8">
            <img
              src="/imagotipo-sig-kallari.webp"
              alt="Kallari Logo"
              className="h-24 w-auto"
            />
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto">
            {/* Page Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark">
                Crear Nueva Contraseña
              </h1>
            </div>

            {/* Form CON ZOD */}
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex w-full flex-col gap-6"
            >
              {/* Token oculto */}
              <input type="hidden" {...register("token")} />

              {/* New Password Field */}
              <div className="space-y-3">
                <label className="flex flex-col">
                  <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                    Nueva Contraseña
                  </p>
                  <PasswordInput
                    placeholder="Introduzca una nueva contraseña"
                    error={errors.newPassword?.message}
                    required
                    disabled={loading || showSuccess}
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

              {/* Confirm New Password Field */}
              <label className="flex flex-col">
                <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">
                  Confirmar Nueva Contraseña
                </p>
                <PasswordInput
                  placeholder="Confirma nueva contraseña"
                  error={errors.confirmPassword?.message}
                  required
                  disabled={loading || showSuccess}
                  {...register("confirmPassword")}
                  containerClassName="focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                  inputClassName="p-3 h-12"
                />
              </label>

              {/* Error Message */}
              {error && (
                <div className="mb-4">
                  <ErrorMessageCard title="Error" message={error} />
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="flex items-center gap-3 rounded-lg border border-accent-success/30 bg-accent-success/10 p-4 text-sm text-accent-success mb-4">
                  <span className="material-symbols-outlined text-base shrink-0">
                    check_circle
                  </span>
                  <p>
                    Tu contraseña ha sido actualizada correctamente.
                    Redirigiendo al login...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="h-12 w-full"
                  disabled={loading || showSuccess || !isValid || !isDirty}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-base">
                        refresh
                      </span>
                      Actualizando...
                    </div>
                  ) : showSuccess ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">
                        check_circle
                      </span>
                      Contraseña actualizada
                    </div>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </LayoutContentContainer>
      </div>
    </LayoutContainer>
  );
};

export default CreateNewPasswordPage;
