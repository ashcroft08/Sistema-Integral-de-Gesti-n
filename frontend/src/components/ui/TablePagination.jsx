// components/UI/TablePagination.jsx
import React from "react";

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
  totalItems,
  showingFrom,
  showingTo,
}) => {
  return (
    <div className="flex flex-col items-center justify-end gap-6 py-4 sm:flex-row w-full">
      {/* SECCIÓN INFORMACIÓN Y SELECTOR */}
      {/* Quitamos sm:justify-start porque ahora todo va alineado por el padre */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary dark:text-background-light/70">
        {/* Texto de información */}
        <span>
          Mostrando{" "}
          <span className="font-medium text-text-primary dark:text-white">
            {showingFrom}
          </span>{" "}
          a{" "}
          <span className="font-medium text-text-primary dark:text-white">
            {showingTo}
          </span>{" "}
          de{" "}
          <span className="font-medium text-text-primary dark:text-white">
            {totalItems}
          </span>{" "}
          resultados
        </span>

        {/* Separador vertical */}
        <span className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 sm:block"></span>

        {/* SELECTOR DE FILAS */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide opacity-80">
            FILAS:
          </span>

          <div className="relative">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={{
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
              className="cursor-pointer rounded-lg border border-primary/20 bg-white bg-none pl-3 pr-8 py-1.5 text-sm font-medium text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-primary/30 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
              <span className="material-symbols-outlined text-lg">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN BOTONES (Se mantiene igual, solo se mueve por el padre) */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-primary/20 p-1.5 hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent dark:border-primary/30 dark:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            chevron_left
          </span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-text-secondary hover:bg-primary/5 dark:text-background-light/70"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-primary/20 p-1.5 hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent dark:border-primary/30 dark:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
