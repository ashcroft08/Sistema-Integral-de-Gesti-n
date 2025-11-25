// src/components/UI/PasswordInput.jsx
import React, { useState } from "react";

const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  error, // ✅ Nuevo prop para errores
  icon = "lock",
  containerClassName = "",
  inputClassName = "",
  required = false,
  disabled = false,
  ...props // ✅ Para soportar register de react-hook-form
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    if (!disabled) {
      setShowPassword(!showPassword);
    }
  };

  return (
    <label className="flex flex-col min-w-40 flex-1">
      {label && (
        <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
      )}
      <div
        className={`
          flex w-full flex-1 items-stretch rounded-lg border 
          bg-background-light dark:bg-background-dark 
          ${containerClassName} 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${
            error
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-border-light dark:border-border-dark"
          }
        `}
      >
        <input
          type={showPassword ? "text" : "password"}
          className={`
            form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg 
            border-0 bg-transparent text-base font-normal leading-normal 
            text-text-light dark:text-text-dark 
            placeholder:text-placeholder-light dark:placeholder:text-placeholder-dark 
            focus:outline-0 focus:ring-0 
            ${inputClassName} 
            ${disabled ? "cursor-not-allowed" : ""}
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete="off"
          {...props} // ✅ Spread props para react-hook-form
        />
        <div className="flex items-center justify-center pr-3">
          <span
            className={`
              material-symbols-outlined 
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
              ${
                error
                  ? "text-red-500"
                  : "text-placeholder-light dark:text-placeholder-dark"
              }
            `}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </div>
      </div>

      {/* ✅ Mostrar error si existe */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </label>
  );
};

export default PasswordInput;
