import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import InputFieldForm from "./InputFieldForm";
import { toast } from "react-toastify";

const RestockModal = ({ isOpen, onClose, onConfirm, product }) => {
  const [cantidad, setCantidad] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cantidad || Number(cantidad) <= 0) {
      toast.error("Ingresa una cantidad válida mayor a 0");
      return;
    }

    setIsSubmitting(true);
    await onConfirm(product.id_producto, Number(cantidad));
    setIsSubmitting(false);
    setCantidad(""); // Limpiar
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reabastecer Inventario"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Confirmar Ingreso"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            Producto: <strong>{product.nombre}</strong>
          </p>
          <p className="text-sm text-blue-800">
            Stock Actual: <strong>{product.stock_actual}</strong>
          </p>
        </div>

        <InputFieldForm
          label="Cantidad a Ingresar (Compra)"
          name="cantidad"
          type="number"
          min="1"
          placeholder="Ej. 50"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          autoFocus
        />
      </form>
    </Modal>
  );
};

export default RestockModal;
