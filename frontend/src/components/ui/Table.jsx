import React from "react";

const Table = ({
  columns,
  data,
  isLoading,
  emptyText = "No hay datos disponibles",
  keyField = "id",
  onRowClick = null,
  sortConfig = null,
  onSort = null,
  pagination = null,
  compact = false,
}) => {
  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="w-full rounded-xl border border-primary/20 bg-white/50 p-12 text-center dark:bg-background-dark/50 dark:border-primary/30">
        <div className="inline-flex items-center gap-3 text-text-secondary dark:text-background-light/70">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="font-medium">Cargando datos...</span>
        </div>
      </div>
    );
  }

  // 2. Estado Vacío
  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-primary/20 bg-white/50 p-12 text-center dark:bg-background-dark/50 dark:border-primary/30">
        <div className="flex flex-col items-center justify-center text-text-secondary dark:text-background-light/60">
          <span className="material-symbols-outlined mb-2 text-4xl opacity-50">
            inbox
          </span>
          <p className="font-medium">{emptyText}</p>
        </div>
      </div>
    );
  }

  // Helper para el ícono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <span className="material-symbols-outlined text-base opacity-30">
          unfold_more
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <span className="material-symbols-outlined text-base text-primary">
        arrow_upward
      </span>
    ) : (
      <span className="material-symbols-outlined text-base text-primary">
        arrow_downward
      </span>
    );
  };

  // 3. Renderizado de la Tabla
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-primary/20 bg-white/50 shadow-sm dark:bg-background-dark/50 dark:border-primary/30 overflow-x-auto">
        <table className="w-full text-left text-sm">
          {/* HEADER */}
          <thead className="border-b border-primary/20 bg-primary/5 text-text-secondary dark:bg-primary/10 dark:border-primary/30 dark:text-background-light/70">
            <tr>
              {columns.map((col, index) => {
                const isSortable = col.sortable && onSort;
                return (
                  <th
                    key={index}
                    scope="col"
                    onClick={() =>
                      isSortable ? onSort(col.accessorKey) : null
                    }
                    // Aquí aplicamos col.className (ej: 'text-right') al th
                    className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                      compact ? "py-3" : "py-4"
                    } ${col.className || ""} ${
                      isSortable
                        ? "cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 select-none"
                        : ""
                    }`}
                  >
                    {/* 🔥 CORRECCIÓN CLAVE AQUÍ:
                       Cambiamos 'flex' por 'inline-flex'. 
                       Esto permite que el contenedor respete el 'text-right' o 'text-center' del padre (th).
                    */}
                    <div className="inline-flex items-center gap-2">
                      {col.header}
                      {isSortable && getSortIcon(col.accessorKey)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-primary/20 dark:divide-primary/30">
            {data.map((row, rowIndex) => (
              <tr
                key={row[keyField] || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`group transition-colors hover:bg-primary/5 dark:hover:bg-primary/10 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-6 text-text-primary dark:text-background-light ${
                      compact ? "py-3" : "py-4"
                    } ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.accessorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && <div className="flex justify-end">{pagination}</div>}
    </div>
  );
};

export default Table;