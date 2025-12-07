import React, { useState, useRef } from "react";
import Modal from "./Modal";
import Button from "./Button";

const CertificateUploadModal = ({ isOpen, onClose, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".p12")) {
        setErrors({ file: "Solo archivos .p12 son permitidos" });
        return;
      }
      setFile(selectedFile);
      setErrors({ ...errors, file: null });
      if (!nombre) {
        setNombre(selectedFile.name.replace(".p12", ""));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!file) newErrors.file = "Archivo requerido";
    if (!password) newErrors.password = "Contraseña requerida";
    if (!nombre) newErrors.nombre = "Nombre requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const result = await onUpload(file, password, nombre);
    if (result.success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setPassword("");
    setNombre("");
    setErrors({});
    setShowPassword(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Subir Certificado Digital"
    >
      <div className="space-y-4">
        {/* Archivo */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-background-light mb-2">
            Archivo .p12 *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".p12"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
          />
          {errors.file && (
            <p className="mt-1 text-sm text-red-600">{errors.file}</p>
          )}
          {file && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">
                check_circle
              </span>
              {file.name}
            </p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-background-light mb-2">
            Nombre Descriptivo *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Certificado Matriz Quito 2024"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-background-dark/50 dark:text-background-light"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-background-light mb-2">
            Contraseña del Certificado *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña del .p12"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-background-dark/50 dark:text-background-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Alerta Seguridad */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg mt-0.5">
              lock
            </span>
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Seguridad:</strong> El certificado se encriptará con
              AES-256 antes de guardarse en la base de datos.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isLoading || !file || !password || !nombre}
          >
            {isLoading ? "Subiendo..." : "Subir Certificado"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateUploadModal;
