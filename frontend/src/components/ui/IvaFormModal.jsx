import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";
import Button from "./Button";
import InputFieldForm from "./InputFieldForm";
import { toast } from "react-toastify";

const IvaFormModal = ({ isOpen, onClose, onSave, iva }) => {
  const isEditMode = !!iva;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      codigo: "",
      porcentaje_iva: "",
      descripcion: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        codigo: iva?.codigo || "",
        porcentaje_iva: iva?.porcentaje_iva || "",
        descripcion: iva?.descripcion || "",
      });
    }
  }, [isOpen, iva, reset]);

  const onSubmit = async (data) => {
    // Conversión de tipos
    const dataToSend = {
      ...data,
      porcentaje_iva: parseInt(data.porcentaje_iva),
    };

    const result = await onSave(dataToSend);

    if (result.success) {
      toast.success(isEditMode ? "IVA actualizado" : "IVA creado");
      onClose();
    } else {
      toast.error(result.error || "Error al guardar");
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} type="button">
        Cancelar
      </Button>
      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Editar Valor de IVA" : "Nuevo Valor de IVA"}
      footer={footer}
    >
      <form className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <InputFieldForm
            label="Código SRI"
            name="codigo"
            placeholder="Ej: 2"
            register={register}
            validation={{ required: "El código es obligatorio" }}
            error={errors.codigo?.message}
          />

          <InputFieldForm
            label="Porcentaje (%)"
            name="porcentaje_iva"
            type="number"
            placeholder="Ej: 12"
            register={register}
            validation={{
              required: "Requerido",
              min: { value: 0, message: "Mínimo 0%" },
              max: { value: 100, message: "Máximo 100%" },
            }}
            error={errors.porcentaje_iva?.message}
          />
        </div>

        <InputFieldForm
          label="Descripción"
          name="descripcion"
          placeholder="Ej: IVA 12%"
          register={register}
          validation={{ required: "La descripción es obligatoria" }}
          error={errors.descripcion?.message}
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
          <p>
            <strong>Nota:</strong> El Código SRI debe corresponder a la tabla
            oficial del SRI (Tabla 16) para que la facturación electrónica sea
            válida.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default IvaFormModal;
