// components/UI/ClientFormModal.jsx - FINAL CORREGIDO
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Modal from "./Modal";
import InputFieldForm from "./InputFieldForm";
import Button from "./Button";
import LocationSelector from "./LocationSelector";
import {
  CreateClientSchema,
  UpdateClientSchema,
} from "../../schemas/client.schema";
import { validarIdentificacionFrontend } from "../../utils/identificacion.validator";

const ClientFormModal = ({
  isOpen,
  onClose,
  onSave,
  client,
  catalogs = { types: [] },
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditMode = !!client;
  const schema = isEditMode ? UpdateClientSchema : CreateClientSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      id_tipo_identificacion: "",
      id_parroquia: "",
      identificacion: "",
      nombre: "",
      apellido: "",
      celular: "",
      email: "",
      direccion: "",
    },
  });

  const id_tipo_identificacion = watch("id_tipo_identificacion");
  const identificacion = watch("identificacion");
  const id_parroquia = watch("id_parroquia");

  // ===== VALIDACIÓN DE IDENTIFICACIÓN =====
  useEffect(() => {
    if (id_tipo_identificacion && identificacion) {
      const tipoSeleccionado = catalogs.types.find(
        (t) => t.id_tipo_identificacion === Number(id_tipo_identificacion)
      );
      if (
        tipoSeleccionado &&
        !validarIdentificacionFrontend(identificacion, tipoSeleccionado.codigo)
      ) {
        setError("identificacion", {
          type: "manual",
          message: `El número ${identificacion} no es válido para el tipo ${tipoSeleccionado.tipo_identificacion}.`,
        });
      } else if (tipoSeleccionado) {
        clearErrors("identificacion");
      }
    }
  }, [
    id_tipo_identificacion,
    identificacion,
    catalogs.types,
    setError,
    clearErrors,
  ]);

  // ===== RESETEAR FORMULARIO =====
  useEffect(() => {
    if (isOpen) {
      if (client) {
        // Modo edición
        reset({
          id_tipo_identificacion: client.id_tipo_identificacion || "",
          id_parroquia: client.id_parroquia || "",
          identificacion: client.identificacion || "",
          nombre: client.nombre || "",
          apellido: client.apellido || "",
          celular: client.celular || "",
          email: client.email || "",
          direccion: client.direccion || "",
        });
      } else {
        // Modo creación
        reset({
          id_tipo_identificacion: "",
          id_parroquia: "",
          identificacion: "",
          nombre: "",
          apellido: "",
          celular: "",
          email: "",
          direccion: "",
        });
      }
    }
  }, [client, isOpen, reset]);

  // ===== SUBMIT =====
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Zod ya transformó los valores, pero aseguramos la conversión
      const dataToSend = {
        id_tipo_identificacion:
          typeof data.id_tipo_identificacion === "string"
            ? Number(data.id_tipo_identificacion)
            : data.id_tipo_identificacion,
        id_parroquia:
          typeof data.id_parroquia === "string"
            ? Number(data.id_parroquia)
            : data.id_parroquia,
        identificacion: data.identificacion.trim(),
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        celular: data.celular.trim(),
        email: data.email.trim().toLowerCase(),
        direccion: data.direccion.trim(),
      };

      // Si estamos en modo edición, incluir el ID
      if (isEditMode && client?.id_cliente) {
        dataToSend.id_cliente = client.id_cliente;
      }

      const result = await onSave(dataToSend);

      if (result && !result.success && result.error) {
        if (result.error.includes("ya está registrado")) {
          setError("identificacion", { type: "manual", message: result.error });
        } else if (result.error.includes("correo")) {
          setError("email", { type: "manual", message: result.error });
        } else {
          toast.error(result.error);
        }
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error("Error inesperado al guardar el cliente");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={handleClose}
        type="button"
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="inline-flex items-center gap-2"
        disabled={isSubmitting || (!isDirty && isEditMode)}
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">
              refresh
            </span>
            {client ? "Guardando..." : "Creando..."}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">save</span>
            {client ? "Actualizar Cliente" : "Crear Cliente"}
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={client ? "Editar Cliente" : "Registrar Nuevo Cliente"}
      footer={footer}
      maxWidth="max-w-5xl" // ⭐ MODAL MÁS ANCHO
    >
      <form
        id="client-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 px-1"
      >
        {/* ===== TIPO DE IDENTIFICACIÓN Y NÚMERO ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputFieldForm
            label="Tipo de Identificación"
            name="id_tipo_identificacion"
            type="select"
            error={errors.id_tipo_identificacion?.message}
            required
            disabled={isSubmitting}
            {...register("id_tipo_identificacion", {
              onChange: () => clearErrors("identificacion"),
            })}
          >
            <option value="">Seleccionar tipo</option>
            {catalogs.types.map((tipo) => (
              <option
                key={tipo.id_tipo_identificacion}
                value={tipo.id_tipo_identificacion}
              >
                {tipo.tipo_identificacion}
              </option>
            ))}
          </InputFieldForm>

          <InputFieldForm
            label="Número de Identificación"
            name="identificacion"
            placeholder="Ej. 1234567890"
            error={errors.identificacion?.message}
            required
            disabled={isSubmitting}
            {...register("identificacion")}
          />
        </div>

        {/* ===== NOMBRES Y APELLIDOS ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputFieldForm
            label="Nombres"
            name="nombre"
            placeholder="Ej. Juan"
            error={errors.nombre?.message}
            required
            disabled={isSubmitting}
            {...register("nombre")}
          />
          <InputFieldForm
            label="Apellidos"
            name="apellido"
            placeholder="Ej. Pérez"
            error={errors.apellido?.message}
            required
            disabled={isSubmitting}
            {...register("apellido")}
          />
        </div>

        {/* ===== CELULAR Y EMAIL ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputFieldForm
            label="Celular"
            name="celular"
            type="tel"
            placeholder="Ej. 0991234567"
            error={errors.celular?.message}
            required
            disabled={isSubmitting}
            {...register("celular")}
          />
          <InputFieldForm
            label="Email"
            name="email"
            type="email"
            placeholder="Ej. usuario@dominio.com"
            error={errors.email?.message}
            required
            disabled={isSubmitting}
            {...register("email")}
          />
        </div>

        {/* ===== UBICACIÓN ===== */}
        <LocationSelector
          value={id_parroquia}
          initialValue={client?.id_parroquia}
          onChange={(parroquiaId) => {
            setValue("id_parroquia", parroquiaId, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          error={errors.id_parroquia?.message}
          disabled={isSubmitting}
          required={true}
        />

        {/* ===== DIRECCIÓN ===== */}
        <InputFieldForm
          label="Dirección"
          name="direccion"
          placeholder="Ej. Av. Principal 123"
          error={errors.direccion?.message}
          required
          disabled={isSubmitting}
          {...register("direccion")}
          multiline={true}
          rows={3}
        />

        {/* ===== INDICADOR DE VALIDACIÓN ===== */}
        {id_tipo_identificacion && identificacion && (
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">
                info
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Validación de identificación
                </p>
                <div className="flex items-center gap-2">
                  {validarIdentificacionFrontend(
                    identificacion,
                    catalogs.types.find(
                      (t) =>
                        t.id_tipo_identificacion ===
                        Number(id_tipo_identificacion)
                    )?.codigo
                  ) ? (
                    <>
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">
                        check_circle
                      </span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Número de identificación válido
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">
                        cancel
                      </span>
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        Número de identificación no válido
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ClientFormModal;
