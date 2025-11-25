// src/components/Login/LoginHeader.jsx
import React from 'react';

const LoginHeader = ({ headline }) => {
  return (
    <div className="flex flex-col items-center">
      {/* ✅ Logo como imagen */}
      <div className="flex justify-center items-center py-8">
        <img
          src="/imagotipo-sig-kallari.webp" // 👈 Ruta relativa desde la carpeta public
          alt="Kallari Logo"
          className="h-24 w-auto" // Ajusta el tamaño según necesites
        />
      </div>
      {/* Headline */}
      <h1 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight text-center pb-4 pt-2">
        {headline}
      </h1>
    </div>
  );
};

export default LoginHeader;