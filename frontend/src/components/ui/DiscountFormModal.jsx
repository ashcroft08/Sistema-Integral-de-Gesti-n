import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";
import Button from "./Button";
import InputFieldForm from "./InputFieldForm";
import { toast } from "react-toastify";

const DiscountFormModal = ({ isOpen, onClose, onSave, discount }) => {
  const isEditMode = !!discount;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      descuento: "",
      porcentaje_descuento: "",
      codigo: "",
      activo: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        descuento: discount?.descuento || "",
        porcentaje_descuento: discount?.porcentaje_descuento || "",
        codigo: discount?.codigo || "",
        activo: discount ? discount.activo : true,
      });
    }
  }, [isOpen, discount, reset]);

  const onSubmit = async (data) => {
    // Formateo de datos
    const dataToSend = {
      ...data,
      porcentaje_descuento: parseFloat(data.porcentaje_descuento),
      codigo: data.codigo.toUpperCase().replace(/\s+/g, "_"), // Forzar formato CODE_123
    };

    const result = await onSave(dataToSend);

    if (result.success) {
      toast.success(isEditMode ? "Descuento actualizado" : "Descuento creado");
      onClose();
    } else {
      toast.error(result.error || "Error al guardar");
    }
  };

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
      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Guardar"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Editar Descuento" : "Nuevo Descuento"}
      footer={footer}
    >
      <form className="flex flex-col gap-4">
        <InputFieldForm
          label="Nombre del Descuento"
          name="descuento"
          placeholder="Ej: Mayorista, Empleado, Navidad"
          register={register}
          validation={{ required: "El nombre es obligatorio" }}
          error={errors.descuento?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputFieldForm
            label="Código (Único)"
            name="codigo"
            placeholder="Ej: DESC_MAYORISTA"
            register={register}
            validation={{
              required: "El código es obligatorio",
              minLength: { value: 3, message: "Mínimo 3 caracteres" },
            }}
            error={errors.codigo?.message}
            onChange={(e) => {
              // Auto-formateo visual a mayúsculas
              setValue(
                "codigo",
                e.target.value.toUpperCase().replace(/\s+/g, "_")
              );
            }}
          />

          <InputFieldForm
            label="Porcentaje (%)"
            name="porcentaje_descuento"
            type="number"
            step="0.01"
            placeholder="Ej: 10.5"
            register={register}
            validation={{
              required: "Requerido",
              min: { value: 0, message: "Mínimo 0%" },
              max: { value: 100, message: "Máximo 100%" },
            }}
            error={errors.porcentaje_descuento?.message}
          />
        </div>

        {/* Checkbox de Activo (Solo visible al editar para poder reactivar/desactivar) */}
        {isEditMode && (
          <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              id="activo"
              {...register("activo")}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="activo"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Descuento Activo (Visible en ventas)
            </label>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default DiscountFormModal;
