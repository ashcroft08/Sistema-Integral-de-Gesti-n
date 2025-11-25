// src/utils/passwordValidator.js

export const validatePassword = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isValid = Object.values(requirements).every(Boolean);
    const errors = !isValid ? getErrorMessages(requirements) : [];

    return {
        isValid,
        errors,
        details: requirements // ← Esto es lo nuevo que necesitas
    };
};

// Función auxiliar para mensajes de error
const getErrorMessages = (requirements) => {
    const messages = [];
    if (!requirements.minLength) messages.push("La contraseña debe tener al menos 8 caracteres");
    if (!requirements.hasUpperCase) messages.push("Debe contener al menos una letra mayúscula");
    if (!requirements.hasLowerCase) messages.push("Debe contener al menos una letra minúscula");
    if (!requirements.hasNumber) messages.push("Debe contener al menos un número");
    if (!requirements.hasSpecialChar) messages.push("Debe contener al menos un carácter especial");
    return messages;
};

// También asegúrate de que getPasswordRequirements devuelva los requisitos en el mismo orden
export const getPasswordRequirements = () => [
    'Al menos 8 caracteres',
    'Al menos una letra mayúscula',
    'Al menos una letra minúscula',
    'Al menos un número',
    'Al menos un carácter especial (!@#$%^&*)',
];

// Función para calcular la fortaleza de la contraseña (ejemplo básico)
export const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return strength;
};