// components/UI/ClientFormModal.jsx
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      apellido: "",
      es_empresa: false,
      celular: "",
      email: "",
      direccion: "",
      id_parroquia: "",
      identificaciones: [
        {
          id_tipo_identificacion: "",
          identificacion: "",
          es_principal: true,
        },
      ],
    },
  });

  // ✅ Manejo de múltiples identificaciones
  const { fields, append, remove } = useFieldArray({
    control,
    name: "identificaciones",
  });

  const id_parroquia = watch("id_parroquia");

  // ===== RESETEAR FORMULARIO =====
  useEffect(() => {
    if (isOpen) {
      if (client) {
        // Modo edición
        const identificaciones =
          client.ClienteIdentificacions?.length > 0
            ? client.ClienteIdentificacions.map((ident) => ({
                id_tipo_identificacion: ident.id_tipo_identificacion,
                identificacion: ident.identificacion,
                es_principal: ident.es_principal || false,
              }))
            : [
                {
                  id_tipo_identificacion: "",
                  identificacion: "",
                  es_principal: true,
                },
              ];

        reset({
          nombre: client.nombre || "",
          apellido: client.apellido || "",
          es_empresa: client.es_empresa || false,
          celular: client.celular || "",
          email: client.email || "",
          direccion: client.direccion || "",
          id_parroquia: client.id_parroquia || "",
          identificaciones,
        });
      } else {
        // Modo creación
        reset({
          nombre: "",
          apellido: "",
          es_empresa: false,
          celular: "",
          email: "",
          direccion: "",
          id_parroquia: "",
          identificaciones: [
            {
              id_tipo_identificacion: "",
              identificacion: "",
              es_principal: true,
            },
          ],
        });
      }
    }
  }, [client, isOpen, reset]);

  // ===== SUBMIT =====
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        es_empresa: data.es_empresa || false,
        celular: data.celular.trim(),
        email: data.email.trim().toLowerCase(),
        direccion: data.direccion.trim(),
        id_parroquia: Number(data.id_parroquia),
        identificaciones: data.identificaciones.map((ident) => ({
          id_tipo_identificacion: Number(ident.id_tipo_identificacion),
          identificacion: ident.identificacion.trim(),
          es_principal: ident.es_principal || false,
        })),
      };

      if (isEditMode && client?.id_cliente) {
        dataToSend.id_cliente = client.id_cliente;
      }

      const result = await onSave(dataToSend);

      if (result && !result.success && result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast.error(error.message || "Error inesperado al guardar el cliente");
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
      maxWidth="max-w-4xl" // Reduje un poco el ancho máximo para mejor lectura
    >
      <form
        id="client-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 px-2 py-2"
      >
        {/* ===== SECCIÓN 1: DATOS DE IDENTIFICACIÓN (UI Mejorada) ===== */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400">
              Documentos de Identidad
            </h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {fields.length} {fields.length === 1 ? "documento" : "documentos"}
            </span>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative p-5 rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 group"
              >
                {/* Botón Eliminar Flotante */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                    disabled={isSubmitting}
                    title="Eliminar identificación"
                  >
                    <span className="material-symbols-outlined text-sm font-bold block">
                      close
                    </span>
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Tipo de ID */}
                  <div className="md:col-span-5">
                    <InputFieldForm
                      label="Tipo de Documento"
                      name={`identificaciones.${index}.id_tipo_identificacion`}
                      type="select"
                      error={
                        errors.identificaciones?.[index]?.id_tipo_identificacion
                          ?.message
                      }
                      required
                      disabled={isSubmitting}
                      {...register(
                        `identificaciones.${index}.id_tipo_identificacion`
                      )}
                    >
                      <option value="">Seleccione tipo...</option>
                      {catalogs.types.map((tipo) => (
                        <option
                          key={tipo.id_tipo_identificacion}
                          value={tipo.id_tipo_identificacion}
                        >
                          {tipo.tipo_identificacion}
                        </option>
                      ))}
                    </InputFieldForm>
                  </div>

                  {/* Número de ID */}
                  <div className="md:col-span-5">
                    <InputFieldForm
                      label="Número de Identificación"
                      name={`identificaciones.${index}.identificacion`}
                      placeholder="Ej. 1723456789"
                      error={
                        errors.identificaciones?.[index]?.identificacion
                          ?.message
                      }
                      required
                      disabled={isSubmitting}
                      {...register(`identificaciones.${index}.identificacion`)}
                    />
                  </div>

                  {/* Checkbox Principal */}
                  <div className="md:col-span-2 flex md:justify-center pt-2 md:pt-8">
                    <label
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer w-full justify-center md:w-auto
                        ${
                          watch(`identificaciones.${index}.es_principal`)
                            ? "bg-primary/5 border-primary/30 text-primary"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500"
                        }`}
                    >
                      <input
                        type="checkbox"
                        {...register(`identificaciones.${index}.es_principal`)}
                        disabled={isSubmitting}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-xs font-medium">Principal</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {/* Mensaje de error general de identificaciones */}
            {errors.identificaciones?.message && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  error
                </span>
                {errors.identificaciones.message}
              </div>
            )}

            {/* BOTÓN GRANDE PARA AGREGAR (ESTILO DASHED) */}
            <button
              type="button"
              onClick={() =>
                append({
                  id_tipo_identificacion: "",
                  identificacion: "",
                  es_principal: false,
                })
              }
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined block text-xl">
                  add
                </span>
              </div>
              <span className="font-medium">Agregar otra identificación</span>
            </button>
          </div>
        </section>

        {/* Separador Visual */}
        <hr className="border-gray-100 dark:border-gray-700" />

        {/* ===== SECCIÓN 2: DATOS PERSONALES ===== */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400 border-b pb-2 border-gray-200 dark:border-gray-700">
            Información Personal
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputFieldForm
              label="Nombres"
              name="nombre"
              placeholder="Ej. Juan Andrés"
              error={errors.nombre?.message}
              required
              disabled={isSubmitting}
              {...register("nombre")}
            />
            <InputFieldForm
              label="Apellidos"
              name="apellido"
              placeholder="Ej. Pérez López"
              error={errors.apellido?.message}
              required
              disabled={isSubmitting}
              {...register("apellido")}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputFieldForm
              label="Celular / Móvil"
              name="celular"
              type="tel"
              placeholder="099..."
              error={errors.celular?.message}
              required
              disabled={isSubmitting}
              {...register("celular")}
            />
            <InputFieldForm
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="cliente@ejemplo.com"
              error={errors.email?.message}
              required
              disabled={isSubmitting}
              {...register("email")}
            />
          </div>
        </section>

        {/* ===== SECCIÓN 3: UBICACIÓN ===== */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400 border-b pb-2 border-gray-200 dark:border-gray-700">
            Dirección y Ubicación
          </h3>

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

          <InputFieldForm
            label="Dirección Exacta (Calle principal, secundaria, número)"
            name="direccion"
            placeholder="Ej. Av. Amazonas y Naciones Unidas..."
            error={errors.direccion?.message}
            required
            disabled={isSubmitting}
            {...register("direccion")}
            multiline={true}
            rows={3}
          />
        </section>
      </form>
    </Modal>
  );
};

export default ClientFormModal;
