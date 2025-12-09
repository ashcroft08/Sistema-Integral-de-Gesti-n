// src/pages/Admin/SettingsPage.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";
import { useUserSettings } from "../../hooks/useUserSettings";
import AdminLayout from "../../components/Layout/AdminLayout";
import InputField from "../../components/UI/InputField";
import PasswordInput from "../../components/UI/PasswordInput";
import Button from "../../components/UI/Button";
import { toast } from "react-toastify";
import { UserSettingsSchema } from "../../schemas/userSettings.schemas";

const SettingsPage = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const { loading, updateProfile, changePassword } = useUserSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(UserSettingsSchema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Observar cambios en los campos de contraseña para determinar si se quiere cambiar
  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");

  // Cargar datos del usuario cuando cambie
  useEffect(() => {
    if (user && !isLoading) {
      reset({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [user, isLoading, reset]);

  // Verificar si hay cambios
  const hasChanges = isDirty;

  // Verificar si se quiere cambiar la contraseña (ambos campos deben estar llenos)
  const wantsToChangePassword = 
    (newPassword && newPassword.trim() !== "") && 
    (currentPassword && currentPassword.trim() !== "");

  const onSubmit = async (data) => {
    try {
      // Verificar si hay cambios en el perfil
      const hasProfileChanges =
        data.nombre !== user.nombre ||
        data.apellido !== user.apellido ||
        data.email !== user.email;

      if (!hasProfileChanges && !wantsToChangePassword) {
        toast.info("No hay cambios para guardar.");
        return;
      }

      // Cambiar contraseña si se solicitó (ambos campos deben estar llenos)
      if (wantsToChangePassword && data.newPassword && data.currentPassword) {
        await changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        });
      }

      // Actualizar perfil si hay cambios
      if (hasProfileChanges) {
        const profileData = {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
        };

        await updateProfile(profileData);
        
        // Actualizar datos en el contexto y localStorage
        await refreshUser();
      }

      // Limpiar campos de contraseña y resetear formulario
      reset({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }, {
        keepValues: false,
      });

    } catch (error) {
      console.error("Error al guardar la información:", error);
      // Los errores ya se muestran en el hook con toast
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales
    if (user) {
      reset({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
    toast.info("Cambios cancelados.");
  };

  // Mostrar loading mientras se inicializa
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
          Perfil de Cuenta
        </h1>
        <p className="text-base font-normal leading-normal text-text-secondary dark:text-background-light/70">
          Administra tu información personal y de seguridad.
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-white/50 p-6 shadow-sm dark:border-primary/30 dark:bg-background-dark/50 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                label="Nombre"
                name="nombre"
                type="text"
                icon="person"
                error={errors.nombre?.message}
                required
                disabled={loading}
                {...register("nombre")}
              />
              <InputField
                label="Apellido"
                name="apellido"
                type="text"
                icon="person"
                error={errors.apellido?.message}
                required
                disabled={loading}
                {...register("apellido")}
              />
            </div>

            <InputField
              label="Email"
              name="email"
              type="email"
              icon="mail"
              error={errors.email?.message}
              required
              disabled={loading}
              {...register("email")}
            />

            <div>
              <h2 className="text-base font-semibold leading-7 text-text-primary dark:text-background-light">
                Cambiar Contraseña
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary dark:text-background-light/70">
                Deja estos campos vacíos si no quieres cambiar la contraseña.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-6">
                <PasswordInput
                  label="Contraseña Actual"
                  name="currentPassword"
                  placeholder="Ingresa tu contraseña actual"
                  error={errors.currentPassword?.message}
                  disabled={loading}
                  {...register("currentPassword")}
                />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <PasswordInput
                    label="Nueva Contraseña"
                    name="newPassword"
                    placeholder="Ingresa nueva contraseña"
                    error={errors.newPassword?.message}
                    disabled={loading}
                    {...register("newPassword")}
                  />
                  <PasswordInput
                    label="Confirmar Nueva Contraseña"
                    name="confirmNewPassword"
                    placeholder="Confirma nueva contraseña"
                    error={errors.confirmNewPassword?.message}
                    disabled={loading}
                    {...register("confirmNewPassword")}
                  />
                </div>
                {errors.newPassword && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <p className="font-medium">Requisitos de contraseña:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Mínimo 8 caracteres, máximo 16</li>
                      <li>Al menos una mayúscula</li>
                      <li>Al menos una minúscula</li>
                      <li>Al menos un número</li>
                      <li>Al menos un carácter especial</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-primary/20 pt-6 dark:border-primary/30">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={loading || !hasChanges}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !hasChanges || !isValid}
            >
              <span className="material-symbols-outlined">save</span>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
