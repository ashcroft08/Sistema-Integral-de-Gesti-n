import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const ControlLotesTable = ({
    lotes,
    loading,
    formatDate,
    formatDecimal,
    formatCurrency,
    onToggleSeco,
    onUpdateOdp,
    onBulkUpdateOdp
}) => {
    const [editingId, setEditingId] = useState(null);
    const [odpValue, setOdpValue] = useState('');
    
    // Custom confirmation modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        lote: null,
        index: null,
        cleanOdp: ''
    });

    const handleStartEdit = (lote) => {
        setEditingId(lote.id_control_lote_org);
        setOdpValue(lote.odp || '');
    };

    const handleSaveOdp = async (lote, index) => {
        const cleanOdp = odpValue.trim();
        if (cleanOdp === lote.odp) {
            setEditingId(null);
            return;
        }

        // If it is the first row, we trigger the custom confirmation modal
        if (index === 0 && lotes.length > 1) {
            setConfirmModal({
                isOpen: true,
                lote,
                index,
                cleanOdp
            });
            setEditingId(null);
            return;
        }

        await onUpdateOdp(lote.id_control_lote_org, cleanOdp);
        setEditingId(null);
    };

    const executeAutocomplete = async () => {
        const { lote, cleanOdp } = confirmModal;
        const updates = [];
        let currentOdp = cleanOdp;
        
        updates.push({
            id_control_lote_org: lote.id_control_lote_org,
            odp: currentOdp
        });

        const incrementOdp = (odpStr, step) => {
            const match = odpStr.match(/^(.*?)(\d+)$/);
            if (!match) return odpStr;
            const prefix = match[1];
            const numStr = match[2];
            const nextNum = parseInt(numStr, 10) + step;
            const paddedNum = String(nextNum).padStart(numStr.length, '0');
            return `${prefix}${paddedNum}`;
        };

        for (let i = 1; i < lotes.length; i++) {
            currentOdp = incrementOdp(cleanOdp, i);
            updates.push({
                id_control_lote_org: lotes[i].id_control_lote_org,
                odp: currentOdp.substring(0, 10)
            });
        }

        await onBulkUpdateOdp(updates);
        setConfirmModal({ isOpen: false, lote: null, index: null, cleanOdp: '' });
    };

    const executeSingleUpdate = async () => {
        const { lote, cleanOdp } = confirmModal;
        await onUpdateOdp(lote.id_control_lote_org, cleanOdp);
        setConfirmModal({ isOpen: false, lote: null, index: null, cleanOdp: '' });
    };

    const handleKeyPress = (e, lote, index) => {
        if (e.key === 'Enter') {
            handleSaveOdp(lote, index);
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
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">¿Es Seco?</th>
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
                        lotes.map((l, idx) => (
                            <tr key={l.id_control_lote_org} className="border-b border-primary/[0.06] hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors text-center text-text-primary dark:text-background-light font-medium">
                                <td className="px-4 py-3">
                                    {editingId === l.id_control_lote_org ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <input
                                                type="text"
                                                value={odpValue}
                                                maxLength={10}
                                                onChange={(e) => setOdpValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyPress(e, l, idx)}
                                                className="w-24 px-2 py-0.5 text-xs rounded border border-primary/30 dark:border-primary/50 bg-white dark:bg-background-dark text-text-primary dark:text-background-light outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveOdp(l, idx)}
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
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                                l.es_seco
                                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30 dark:bg-amber-500/20'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-xs font-bold">
                                                {l.es_seco ? 'water_drop' : 'cloud'}
                                            </span>
                                            {l.es_seco ? 'Seco' : 'Húmedo'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Custom confirmation modal for first-row ODP change */}
            {confirmModal.isOpen && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-250">
                    <div className="bg-white dark:bg-background-dark border border-primary/10 dark:border-primary/20 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-2xl font-bold">dynamic_form</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary dark:text-background-light leading-snug">
                                    Autocompletar Secuencia de ODPs
                                </h3>
                                <p className="text-xs text-text-secondary/70 dark:text-background-light/50">
                                    Edición detectada en la primera fila
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-text-primary/80 dark:text-background-light/70 mb-5 leading-relaxed">
                            Ha ingresado la ODP <strong className="text-primary font-mono">{confirmModal.cleanOdp}</strong> en la primera fila. ¿Desea rellenar automáticamente las siguientes ODPs de forma secuencial?
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={executeAutocomplete}
                                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">auto_mode</span>
                                Sí, autocompletar secuencialmente
                            </button>
                            
                            <button
                                onClick={executeSingleUpdate}
                                className="w-full py-2.5 rounded-xl border border-primary/30 text-text-primary dark:text-background-light text-sm font-semibold hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">pin</span>
                                No, solo aplicar a esta fila
                            </button>

                            <button
                                onClick={() => setConfirmModal({ isOpen: false, lote: null, index: null, cleanOdp: '' })}
                                className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-text-secondary hover:text-red-500 text-sm font-semibold transition-all cursor-pointer"
                            >
                                Cancelar (Descartar cambios)
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ControlLotesTable;
