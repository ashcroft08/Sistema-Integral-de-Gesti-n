import React, { useState } from 'react';

const ControlLotesCvTable = ({
    lotes,
    loading,
    formatDate,
    formatDecimal,
    formatCurrency,
    onToggleSeco,
    onUpdateOdp
}) => {
    const [editingId, setEditingId] = useState(null);
    const [odpValue, setOdpValue] = useState('');

    const handleStartEdit = (lote) => {
        setEditingId(lote.id_control_lote_cv);
        setOdpValue(lote.odp || '');
    };

    const handleSaveOdp = async (lote) => {
        const cleanOdp = odpValue.trim();
        if (cleanOdp === lote.odp) {
            setEditingId(null);
            return;
        }

        await onUpdateOdp(lote.id_control_lote_cv, cleanOdp);
        setEditingId(null);
    };

    const handleKeyPress = (e, lote) => {
        if (e.key === 'Enter') {
            handleSaveOdp(lote);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="border-b border-primary/10 dark:border-primary/20 text-center font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider text-xs">
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">ODP</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-left">Lote</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Fecha</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-left">Ruta Compra</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">Libras</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">Costo</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="text-center py-10">Cargando control de lotes...</td>
                        </tr>
                    ) : lotes.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-text-secondary">No se encontraron lotes para este período.</td>
                        </tr>
                    ) : (
                        lotes.map((l) => (
                            <tr key={l.id_control_lote_cv} className="border-b border-primary/[0.06] hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors text-center text-text-primary dark:text-background-light font-medium">
                                <td className="px-4 py-3">
                                    {editingId === l.id_control_lote_cv ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <input
                                                type="text"
                                                value={odpValue}
                                                maxLength={10}
                                                onChange={(e) => setOdpValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyPress(e, l)}
                                                className="w-24 px-2 py-0.5 text-xs rounded border border-primary/30 dark:border-primary/50 bg-white dark:bg-background-dark text-text-primary dark:text-background-light outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveOdp(l)}
                                                className="p-0.5 bg-emerald-500/10 text-emerald-600 rounded hover:bg-emerald-500/20 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-xs">done</span>
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-0.5 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-xs">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1.5 group/odp">
                                            <span className={`font-mono text-xs ${l.odp ? 'font-semibold text-text-primary dark:text-background-light' : 'text-text-secondary/50'}`}>
                                                {l.odp || 'Sin Asignar'}
                                            </span>
                                            <button
                                                onClick={() => handleStartEdit(l)}
                                                className="p-0.5 hover:bg-primary/10 rounded text-text-secondary hover:text-primary transition-colors cursor-pointer"
                                                title="Editar ODP"
                                            >
                                                <span className="material-symbols-outlined text-xs">edit</span>
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-left font-bold text-primary">{l.lote}</td>
                                <td className="px-4 py-3">{formatDate(l.fecha)}</td>
                                <td className="px-4 py-3 text-left">{l.ruta_compra}</td>
                                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatDecimal(l.cantidad_libra)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{formatCurrency(l.costo)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={() => onToggleSeco(l)}
                                            title="Haga clic para alternar entre Húmedo y Seco"
                                            className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 hover:shadow-sm ${
                                                l.es_seco
                                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 hover:bg-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30 dark:bg-amber-500/20 hover:bg-amber-500/20'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-xs font-bold group-hover:rotate-180 transition-transform duration-300">
                                                {l.es_seco ? 'water_drop' : 'cloud'}
                                            </span>
                                            {l.es_seco ? 'Seco' : 'Húmedo'}
                                            <span className="material-symbols-outlined text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                                                sync
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ControlLotesCvTable;
