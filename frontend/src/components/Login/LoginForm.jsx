// src/components/Login/LoginForm.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../UI/InputField";
import PasswordInput from "../UI/PasswordInput";
import Button from "../UI/Button";
import { LoginSchema } from "../../schemas/auth.schemas";

const LoginForm = ({ onLogin, loading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    if (onLogin) {
      onLogin(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {/* Email Field */}
      <div className="flex w-full flex-wrap items-end gap-4 px-4 py-3">
        <InputField
          label="Correo electrónico"
          type="email"
          placeholder="you@example.com"
          icon="mail"
          error={errors.email?.message}
          required
          disabled={loading}
          {...register("email")}
        />
      </div>

      {/* Password Field */}
      <div className="flex w-full flex-wrap items-end gap-4 px-4 py-3">
        <PasswordInput
          label="Contraseña"
          placeholder="Introduzca su contraseña"
          error={errors.password?.message}
          required
          disabled={loading}
          {...register("password")}
        />
      </div>

      {/* Forgot Password Link */}
      <div className="w-full text-right px-4 pt-1 pb-4">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-accent hover:underline"
        >
          ¿Olvidaste la contraseña?
        </Link>
      </div>

      {/* Login Button */}
      <div className="w-full px-4 pt-4 pb-2">
        <Button
          type="submit"
          disabled={loading || !isValid || !isDirty}
          className={`
            w-full h-14 rounded-lg font-medium text-base
            ${
              loading || !isValid || !isDirty
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-accent hover:bg-accent/90"
            }
          `}
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
