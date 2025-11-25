// tailwind.config.js
import formsPlugin from '@tailwindcss/forms';
import containerQueriesPlugin from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Asegúrate de que sea 'class'
  theme: {
    extend: {
      colors: {
        // Tus colores anteriores
        "primary": "#4A2C2A",
        "background-light": "#F8F6F4",
        "background-dark": "#1a1614",
        "text-light": "#3D352E",
        "text-dark": "#EAE8E6",
        "accent": "#B5651D",
        "error": "#D9534F",
        // Nuevos colores para el dashboard
        //"primary": "#D08C60",
        //"background-light": "#FDFBF6", // Sobrescribe si es diferente
        //"background-dark": "#211911", // Sobrescribe si es diferente
        "text-primary": "#5D4037",
        "text-secondary": "#A3B18A",
        "status-online": "#588157",
        "status-offline": "#8D99AE",
        "status-syncing": "#2A9D8F",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "heading": ["Playfair Display", "serif"], // Añade la nueva fuente
      },
      borderRadius: {
        "DEFAULT": "0.25rem", // Puede sobrescribir la anterior
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px",
      },
    },
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin,
  ],
}