// src/components/UI/InputField.jsx
import React from "react";

const InputField = ({
  label,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error, // ✅ Nuevo prop para errores
  required = false,
  disabled = false,
  ...props // ✅ Para soportar register de react-hook-form
}) => {
  return (
    <label className="flex flex-col min-w-40 flex-1">
      <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="relative flex w-full items-center">
        {/* Ícono */}
        <span className="material-symbols-outlined absolute left-4 text-text-light/60 dark:text-text-dark/60">
          {icon}
        </span>

        {/* Input */}
        <input
          type={type}
          className={`
            form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg 
            text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-accent/50 
            border-none bg-black/5 dark:bg-white/5 h-14 placeholder:text-text-light/50 
            dark:placeholder:text-text-dark/50 pl-12 pr-4 py-2 text-base font-normal leading-normal 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${
              error
                ? "!bg-red-50 dark:!bg-red-900/20 !ring-2 !ring-red-500"
                : ""
            }
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          {...props} // ✅ Spread props para react-hook-form
        />
      </div>

      {/* ✅ Mostrar error si existe */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </label>
  );
};

export default InputField;
