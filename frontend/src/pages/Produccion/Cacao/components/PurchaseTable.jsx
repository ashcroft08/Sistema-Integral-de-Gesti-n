import React from 'react';

/**
 * PurchaseTable - Reusable component for display of compras table with pagination.
 */
const PurchaseTable = ({
    compras,
    total,
    pagina,
    totalPaginas,
    loading,
    selectedPeriod,
    activePeriodObj,
    fetchCompras,
    formatDate
}) => {
    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0.00';
        return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    };

    return (
        <div className="rounded-2xl border border-primary/15 dark:border-primary/25 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in-50 duration-200">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 dark:border-primary/20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-xl">table_chart</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-primary dark:text-background-light">
                            Tabla de Registros ({activePeriodObj?.nombre})
                        </h3>
                        <p className="text-xs text-text-secondary dark:text-background-light/40">
                            {total.toLocaleString('es-EC')} compras normalizadas
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar relative">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-primary/10 dark:border-primary/20">
                            {['#', 'Número', 'Fecha', 'Comunidad', 'Código', 'Proveedor', 'Categoría', 'Producto', 'Cantidad', 'V. Unitario', 'Total', 'Negociador'].map((col) => (
                                <th
                                    key={col}
                                    className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/[0.06] dark:divide-primary/[0.12]">
                        {loading && compras.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 animate-pulse">
                                            <span className="material-symbols-outlined text-2xl text-primary/40">hourglass_top</span>
                                        </div>
                                        <p className="text-sm text-text-secondary dark:text-background-light/40">Cargando compras...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            compras.map((compra, idx) => {
                                const rowId = compra.id_compra_general || idx;
                                return (
                                    <tr
                                        key={rowId}
                                        className={`transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] ${
                                            idx % 2 === 0
                                                ? 'bg-transparent'
                                                : 'bg-primary/[0.015] dark:bg-primary/[0.04]'
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-xs font-mono text-text-secondary dark:text-background-light/40">
                                            {(pagina - 1) * 20 + idx + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-text-primary dark:text-background-light whitespace-nowrap">
                                            {compra.numero || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 whitespace-nowrap">
                                            {formatDate(compra.fecha)}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 whitespace-nowrap">
                                            {compra.comunidad || '—'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-text-primary/70 dark:text-background-light/60 whitespace-nowrap">
                                            {compra.codigo || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 whitespace-nowrap font-medium text-primary dark:text-accent">
                                            {compra.proveedor || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary/70 dark:text-background-light/60 whitespace-nowrap">
                                            {compra.categoria || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 whitespace-nowrap font-medium text-primary dark:text-accent">
                                            {compra.producto || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-text-primary dark:text-background-light tabular-nums whitespace-nowrap">
                                            {compra.cantidad ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                                            {formatCurrency(compra.valor_unitario)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                                            {formatCurrency(compra.total)}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary/70 dark:text-background-light/60 whitespace-nowrap">
                                            {compra.negociador || '—'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ═══════ PAGINATION ═══════ */}
            {totalPaginas > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-primary/10 dark:border-primary/20">
                    <p className="text-xs text-text-secondary dark:text-background-light/40">
                        Página <span className="font-bold text-text-primary dark:text-background-light">{pagina}</span> de{' '}
                        <span className="font-bold text-text-primary dark:text-background-light">{totalPaginas}</span>
                        {' · '}{total.toLocaleString('es-EC')} registros
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchCompras(1, 20, selectedPeriod)}
                            disabled={pagina <= 1 || loading}
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">first_page</span>
                        </button>
                        <button
                            onClick={() => fetchCompras(pagina - 1, 20, selectedPeriod)}
                            disabled={pagina <= 1 || loading}
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>

                        {/* Page numbers */}
                        {(() => {
                            const pages = [];
                            let start = Math.max(1, pagina - 2);
                            let end = Math.min(totalPaginas, pagina + 2);
                            if (pagina <= 3) end = Math.min(5, totalPaginas);
                            if (pagina >= totalPaginas - 2) start = Math.max(1, totalPaginas - 4);

                            for (let i = start; i <= end; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => fetchCompras(i, 20, selectedPeriod)}
                                        disabled={loading}
                                        className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                            i === pagina
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'border border-primary/15 dark:border-primary/25 text-text-primary/60 dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }
                            return pages;
                        })()}

                        <button
                            onClick={() => fetchCompras(pagina + 1, 20, selectedPeriod)}
                            disabled={pagina >= totalPaginas || loading}
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                        <button
                            onClick={() => fetchCompras(totalPaginas, 20, selectedPeriod)}
                            disabled={pagina >= totalPaginas || loading}
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">last_page</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseTable;
