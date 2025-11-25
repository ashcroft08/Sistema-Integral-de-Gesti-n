// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import LayoutContainer from "../components/Layout/LayoutContainer";
import LayoutContentContainer from "../components/Layout/LayoutContentContainer";
import InputField from "../components/UI/InputField";
import Button from "../components/UI/Button";
import ErrorMessageCard from "../components/UI/ErrorMessageCard";
import { ForgotPasswordSchema } from "../schemas/auth.schemas";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const handleResetPassword = async (data) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setSuccess(true);
        // Redirigir a la página de confirmación después de un momento
        setTimeout(() => {
          navigate("/reset-password-sent", { state: { email: data.email } });
        }, 1500);
      }
    } catch (error) {
      setError(error.message || "Error al solicitar el reseteo de contraseña");
    } finally {
      setLoading(false);
    }
  };

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
                  alt="eco Artisanale"
                  className="h-24 w-auto"
                />
              </div>
              <h1 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight text-center pb-2 pt-2">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-text-light/80 dark:text-text-dark/80 text-base text-center pb-8">
                Ingresa tu email y te enviaremos un enlace para restablecer tu
                contraseña.
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="px-4 pb-4">
                <ErrorMessageCard title="Error" message={error} />
              </div>
            )}

            {/* Mensaje de éxito */}
            {success && (
              <div className="px-4 pb-4">
                <div className="rounded-lg border border-accent-success/30 bg-accent-success/10 p-3 text-sm text-accent-success">
                  <p>
                    Si tu email está registrado, recibirás un enlace de
                    recuperación.
                  </p>
                </div>
              </div>
            )}

            {/* Formulario CON ZOD */}
            <form
              onSubmit={handleSubmit(handleResetPassword)}
              className="flex flex-col"
            >
              {/* Campo de Email */}
              <div className="flex w-full flex-wrap items-end gap-4 px-4 py-3">
                <InputField
                  label="Correo electrónico"
                  type="email"
                  placeholder="you@example.com"
                  icon="mail"
                  error={errors.email?.message}
                  required
                  disabled={loading || success}
                  {...register("email")}
                />
              </div>

              {/* Botón de Enviar */}
              <div className="w-full px-4 pt-4 pb-2">
                <Button
                  type="submit"
                  disabled={loading || success || !isValid || !isDirty}
                  className={`
                    w-full h-14 rounded-lg font-medium text-base
                    ${
                      loading || success || !isValid || !isDirty
                        ? "bg-gray-400 cursor-not-allowed text-gray-600"
                        : "bg-accent hover:bg-accent/90 text-white"
                    }
                  `}
                >
                  {loading
                    ? "Enviando..."
                    : success
                    ? "Enviado"
                    : "Enviar enlace de recuperación"}
                </Button>
              </div>
            </form>

            {/* Enlace de Volver */}
            <div className="text-center py-6">
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-accent hover:underline text-sm flex items-center justify-center gap-2 group mx-auto"
              >
                <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                Volver al inicio de sesión
              </button>
            </div>
          </LayoutContentContainer>
        </div>
      </LayoutContainer>
    </div>
  );
};

export default ForgotPasswordPage;