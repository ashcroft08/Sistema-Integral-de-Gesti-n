// src/pages/ResetPasswordSentPage.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LayoutContainer from "../components/Layout/LayoutContainer";
import LayoutContentContainer from "../components/Layout/LayoutContentContainer";
import Button from "../components/UI/Button";
import { Link } from "react-router-dom";

const ResetPasswordSentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "tu correo electrónico";

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <LayoutContainer>
        <div className="flex flex-1 justify-center py-5">
          <LayoutContentContainer>
            {/* Contenido principal centrado */}
            <div className="flex-grow flex flex-col justify-center items-center text-center">
              {/* Ícono de confirmación */}
              <div className="mb-6">
                <span className="material-symbols-outlined text-7xl text-accent">
                  mark_email_read
                </span>
              </div>
              {/* Título */}
              <h1 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight pb-3">
                Revisa tu correo electrónico
              </h1>
              {/* Mensaje */}
              <p className="text-text-light/80 dark:text-text-dark/80 max-w-sm">
                Hemos enviado un enlace de recuperación de contraseña a{" "}
                <span className="font-bold text-text-light dark:text-text-dark">
                  {email}
                </span>
                .
              </p>
            </div>

            {/* Botón de Volver al Login */}
            <div className="w-full px-4 pt-4 pb-2">
              <Button onClick={() => navigate("/login")}>
                Volver al inicio de sesión
              </Button>
            </div>

            {/* Enlace de reenvío */}
            <div className="text-center py-6">
              <p className="text-sm text-text-light/80 dark:text-text-dark/80">
                ¿No recibiste el correo?{" "}
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="font-bold text-accent hover:underline"
                >
                  Reenviar enlace
                </button>
              </p>
            </div>
          </LayoutContentContainer>
        </div>
      </LayoutContainer>
    </div>
  );
};

export default ResetPasswordSentPage;
