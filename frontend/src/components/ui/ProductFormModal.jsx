import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Modal from "./Modal";
import InputFieldForm from "./InputFieldForm";
import Button from "./Button";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../../schemas/product.schemas";

const ProductFormModal = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories = [],
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditMode = !!product;
  const schema = isEditMode ? UpdateProductSchema : CreateProductSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      id_categoria: "",
      precio: "",
      stock_actual: "",
      stock_minimo: "",
    },
  });

  // Observar cambios en stock para validaciones dinámicas
  const stockActual = watch("stock_actual");
  const stockMinimo = watch("stock_minimo");

  // Validación dinámica de stock
  useEffect(() => {
    if (stockMinimo && stockActual !== "" && stockActual !== null) {
      const stockActualNum = Number(stockActual);
      const stockMinimoNum = Number(stockMinimo);

      if (stockActualNum !== 0 && stockMinimoNum > stockActualNum) {
        setError("stock_minimo", {
          type: "manual",
          message: "El stock mínimo no puede ser mayor al stock actual",
        });
      } else {
        clearErrors("stock_minimo");
      }
    }
  }, [stockActual, stockMinimo, setError, clearErrors]);

  // Resetear formulario cuando cambia el producto o se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Modo edición: Rellenar datos
        reset({
          nombre: product.nombre || "",
          id_categoria:
            product.id_categoria ||
            product.CategoriaProducto?.id_categoria ||
            "",
          precio: product.precio || 0,
          stock_actual: product.stock_actual || 0,
          stock_minimo: product.stock_minimo || 0,
        });
      } else {
        // Modo creación: Limpiar
        reset({
          nombre: "",
          id_categoria: "",
          precio: "",
          stock_actual: "",
          stock_minimo: "",
        });
      }
    }
  }, [product, isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Conversión de tipos con validación
      const dataToSend = {
        nombre: data.nombre.trim(),
        id_categoria: Number(data.id_categoria),
        precio: Number(data.precio),
        stock_actual: Number(data.stock_actual),
        stock_minimo: Number(data.stock_minimo),
      };

      // Validación adicional antes de enviar
      if (isNaN(dataToSend.id_categoria) || dataToSend.id_categoria <= 0) {
        toast.error("Selecciona una categoría válida");
        setIsSubmitting(false);
        return;
      }

      if (isNaN(dataToSend.precio) || dataToSend.precio < 0) {
        toast.error("Ingresa un precio válido");
        setIsSubmitting(false);
        return;
      }

      const result = await onSave(dataToSend);

      if (result && !result.success && result.error) {
        // Manejar errores específicos del backend
        if (result.error.includes("ya está registrado")) {
          setError("nombre", {
            type: "manual",
            message: result.error,
          });
        } else {
          toast.error(result.error);
        }
        setIsSubmitting(false);
      } else {
        // Éxito - el modal se cierra desde InventoryPage
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Error inesperado al guardar el producto");
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
            {product ? "Guardando..." : "Creando..."}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">save</span>
            {product ? "Actualizar Producto" : "Crear Producto"}
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? "Editar Producto" : "Registrar Nuevo Producto"}
      footer={footer}
    >
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Nombre */}
        <InputFieldForm
          label="Nombre del Producto"
          name="nombre"
          placeholder="Ej. Chocolate Barra 50g"
          error={errors.nombre?.message}
          required
          disabled={isSubmitting}
          {...register("nombre")}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Categoría */}
          <InputFieldForm
            label="Categoría"
            name="id_categoria"
            type="select"
            error={errors.id_categoria?.message}
            required
            disabled={isSubmitting}
            {...register("id_categoria", {
              setValueAs: (v) => (v === "" ? "" : Number(v)),
            })}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.categoria}
              </option>
            ))}
          </InputFieldForm>

          {/* Precio */}
          <InputFieldForm
            label="Precio ($)"
            name="precio"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.precio?.message}
            required
            disabled={isSubmitting}
            {...register("precio", {
              setValueAs: (v) => (v === "" ? "" : Number(v)),
            })}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Stock Actual */}
          <InputFieldForm
            label="Stock Actual"
            name="stock_actual"
            type="number"
            min="0"
            placeholder="0"
            error={errors.stock_actual?.message}
            required
            disabled={isSubmitting}
            {...register("stock_actual", {
              setValueAs: (v) => (v === "" ? "" : Number(v)),
            })}
          />

          {/* Stock Mínimo */}
          <InputFieldForm
            label="Stock Mínimo (Alerta)"
            name="stock_minimo"
            type="number"
            min="0"
            placeholder="5"
            error={errors.stock_minimo?.message}
            required
            disabled={isSubmitting}
            {...register("stock_minimo", {
              setValueAs: (v) => (v === "" ? "" : Number(v)),
            })}
          />
        </div>

        {/* Hint informativo */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg mt-0.5">
              info
            </span>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Nota sobre el stock:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Si el stock llega a 0, el producto se marcará automáticamente
                  como "Agotado"
                </li>
                <li>
                  El stock mínimo sirve como alerta temprana de bajo inventario
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
