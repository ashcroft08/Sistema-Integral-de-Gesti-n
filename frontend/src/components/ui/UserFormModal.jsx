import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "./Modal";
import InputFieldForm from "./InputFieldForm";
import PasswordInputForm from "./PasswordInputForm";
import Button from "./Button";
import { CreateUserSchema, UpdateUserSchema } from "../../schemas/user.schemas";

const UserFormModal = ({ isOpen, onClose, onSave, user, roles }) => {
  const [showPasswordFields, setShowPasswordFields] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditMode = !!user;
  const schema = isEditMode ? UpdateUserSchema : CreateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      id_rol: "",
      password: "",
      confirmarContrasena: "",
    },
  });

  // Resetear formulario cuando cambia el usuario o se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Modo edición
        reset({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          email: user.email || "",
          id_rol: user.id_rol || user.Rol?.id_rol || "",
          password: "",
          confirmarContrasena: "",
        });
        setShowPasswordFields(false);
      } else {
        // Modo creación
        reset({
          nombre: "",
          apellido: "",
          email: "",
          id_rol: "",
          password: "",
          confirmarContrasena: "",
        });
        setShowPasswordFields(true);
      }
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Preparar datos para enviar
      // El schema ya convierte id_rol a número
      const dataToSend = {
        ...data,
        id_usuario: user ? user.id_usuario : undefined,
      };

      // En modo edición, si no se cambia la contraseña, no enviar campos de contraseña
      if (user && (!data.password || !showPasswordFields)) {
        delete dataToSend.password;
        delete dataToSend.confirmarContrasena;
      }

      const result = await onSave(dataToSend);

      if (result && !result.success) {
        // Si hay errores del servidor, mostrarlos
        // Los errores ya se muestran en el toast desde handleSaveUser
        setIsSubmitting(false);
      } else {
        // Éxito - el modal se cierra desde handleSaveUser
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      setIsSubmitting(false);
    }
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (!showPasswordFields) {
      // Al mostrar, limpiar campos de contraseña
      setValue("password", "");
      setValue("confirmarContrasena", "");
    } else {
      // Al ocultar, limpiar campos de contraseña
      setValue("password", "");
      setValue("confirmarContrasena", "");
    }
  };

  // Determinar si el formulario es válido
  // En modo edición sin campos de contraseña, solo validar campos básicos
  const isFormValid = isEditMode
    ? showPasswordFields
      ? isValid && isDirty
      : isDirty // En edición sin contraseña, solo necesita estar dirty
    : isValid && isDirty;

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={onClose}
        type="button"
        disabled={isSubmitting}
      >
        Cancelar
      </Button>

      <Button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="inline-flex items-center gap-2"
        disabled={isSubmitting || !isFormValid}
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">
              refresh
            </span>
            {user ? "Actualizando usuario..." : "Creando usuario..."}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">save</span>
            {user ? "Actualizar usuario" : "Crear usuario"}
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Editar Usuario" : "Registrar Nuevo Usuario"}
      footer={footer}
    >
      <form
        id="user-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputFieldForm
            label="Nombre"
            name="nombre"
            placeholder="Ej. Juan"
            error={errors.nombre?.message}
            required
            disabled={isSubmitting}
            {...register("nombre")}
          />
          <InputFieldForm
            label="Apellido"
            name="apellido"
            placeholder="Ej. Pérez"
            error={errors.apellido?.message}
            required
            disabled={isSubmitting}
            {...register("apellido")}
          />
        </div>

        <InputFieldForm
          label="Email"
          name="email"
          type="email"
          placeholder="Ej. juan.perez@example.com"
          error={errors.email?.message}
          required
          disabled={isSubmitting}
          {...register("email")}
        />

        <InputFieldForm
          label="Rol"
          name="id_rol"
          type="select"
          error={errors.id_rol?.message}
          required
          disabled={isSubmitting}
          {...register("id_rol")}
        >
          <option value="">Seleccionar un rol</option>
          {roles.map((role) => (
            <option key={role.id_rol} value={role.id_rol}>
              {role.rol}
            </option>
          ))}
        </InputFieldForm>

        {/* Campos de contraseña */}
        {!user && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <PasswordInputForm
                label="Contraseña"
                name="password"
                placeholder="••••••••"
                error={errors.password?.message}
                required
                disabled={isSubmitting}
                {...register("password")}
              />
              <PasswordInputForm
                label="Confirmar Contraseña"
                name="confirmarContrasena"
                placeholder="••••••••"
                error={errors.confirmarContrasena?.message}
                required
                disabled={isSubmitting}
                {...register("confirmarContrasena")}
              />
            </div>
            {errors.password && (
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
          </>
        )}

        {/* Sección de seguridad para edición */}
        {user && (
          <div className="border-t border-primary/20 pt-4 dark:border-primary/30">
            <h3 className="text-base font-semibold text-text-primary dark:text-background-light mb-2">
              Seguridad
            </h3>
            <p className="text-sm text-text-secondary dark:text-background-light/70 mb-4">
              {showPasswordFields
                ? "Ingresa la nueva contraseña para el usuario."
                : "Gestiona la contraseña del usuario."}
            </p>

            <Button
              variant="outline"
              onClick={togglePasswordFields}
              type="button"
              // CAMBIOS AQUÍ: w-full y justify-center
              className="inline-flex items-center justify-center gap-2 w-full"
              disabled={isSubmitting}
            >
              <span className="material-symbols-outlined text-base">
                {showPasswordFields ? "lock" : "lock_reset"}
              </span>
              {showPasswordFields ? "Cancelar Cambio" : "Cambiar Contraseña"}
            </Button>

            {showPasswordFields && (
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <PasswordInputForm
                  label="Nueva Contraseña"
                  name="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  {...register("password")}
                />
                <PasswordInputForm
                  label="Confirmar Contraseña"
                  name="confirmarContrasena"
                  placeholder="••••••••"
                  error={errors.confirmarContrasena?.message}
                  disabled={isSubmitting}
                  {...register("confirmarContrasena")}
                />
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UserFormModal;
