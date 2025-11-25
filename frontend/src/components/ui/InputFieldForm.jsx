// src/components/UI/InputFieldForm.jsx
import React from "react";

const InputFieldForm = ({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error = "",
  children,
  containerClassName = "", // <--- Añadido
  inputClassName = "", // <--- Añadido
  required = false,
  disabled = false,
  ...props // Para soportar register de react-hook-form
}) => {
  const borderClass = error ? "border-red-500" : "border-primary/30";

  if (type === "select") {
    return (
      <div className={`flex flex-col ${containerClassName}`}> {/* <--- Aplicado */}
        {/* El label ahora es condicional */}
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-background-light/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              {icon}
            </span>
          )}
          <select
            name={name}
            className={`w-full appearance-none rounded-lg border ${borderClass} bg-white/50 py-2 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light ${
              icon ? "pl-10" : "pl-4" // <--- Padding condicional
            } h-14 ${inputClassName}`} // <--- Altura h-14 y className aplicado
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            {...props}
          >
            {children}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary/80">
            expand_more
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* El label ahora es condicional */}
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-background-light/80">
          {label}
        </label>
      )}
      <div
        className={`relative flex w-full items-center ${containerClassName}`} // <--- Aplicado
      >
        {icon && (
          <span className="material-symbols-outlined absolute left-4 text-text-light/60 dark:text-text-dark/60">
            {icon}
          </span>
        )}
        <input
          name={name}
          type={type}
          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-accent/50 border ${borderClass} bg-black/5 dark:bg-white/5 h-14 placeholder:text-text-light/50 dark:placeholder:text-text-dark/50 pr-4 py-2 text-base font-normal leading-normal ${
            icon ? "pl-12" : "pl-4" // <--- Padding condicional
          } ${inputClassName}`} // <--- className aplicado
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default InputFieldForm;