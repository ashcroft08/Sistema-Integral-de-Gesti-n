// src/components/UI/PasswordInputForm.jsx
import React, { useState } from "react";

const PasswordInputForm = ({
  label,
  name, // Añadido
  placeholder,
  value,
  onChange,
  icon = "lock",
  containerClassName = "",
  inputClassName = "",
  error = "", // Añadido
  required = false,
  disabled = false,
  ...props // Para soportar register de react-hook-form
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Ajustar borde si hay error
  const borderClass = error ? "border-red-500" : "border-primary/30";

  return (
    <div className="flex flex-col">
      <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-background-light/80">
        {label}
      </label>
      <div
        className={`flex w-full flex-1 items-stretch rounded-lg border ${borderClass} bg-background-light/50 dark:bg-background-dark/50 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary ${containerClassName}`}
      >
        <input
          name={name} // Añadido
          type={showPassword ? "text" : "password"}
          className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg border-0 bg-transparent text-base font-normal leading-normal text-text-primary dark:text-background-light placeholder:text-text-secondary/60 focus:outline-0 focus:ring-0 ${inputClassName}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          {...props}
        />
        <div className="flex items-center justify-center pr-3">
          <span
            className="material-symbols-outlined cursor-pointer text-placeholder-light dark:text-placeholder-dark"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}{" "}
      {/* Añadido */}
    </div>
  );
};

export default PasswordInputForm;
