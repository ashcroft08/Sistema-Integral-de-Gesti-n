import React from 'react';

const ErrorMessageCard = ({ title, message }) => {
  return (
    <div className="p-4">
      {/* Asumiendo que @container es manejado por Tailwind si está en el plugin */}
      {/* Si no, puedes omitir la clase @container o usar un div contenedor */}
      <div className="flex flex-col items-stretch justify-start rounded-lg bg-error xl:flex-row xl:items-start p-4">
        <div className="flex items-center justify-center pr-4">
          <span className="material-symbols-outlined text-white text-3xl">lock</span>
        </div>
        <div className="flex w-full min-w-0 grow flex-col items-stretch justify-center gap-1">
          <p className="text-white text-base font-bold leading-tight">{title}</p>
          <div className="flex items-end gap-3 justify-between">
            <p className="text-white/90 text-sm font-normal leading-normal">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessageCard;