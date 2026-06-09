import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ComercializacionCvTable = ({
    lotes,
    loading,
    formatDate,
    formatDecimal,
    onOpenRegisterModal
}) => {
    const [activeTooltipId, setActiveTooltipId] = useState(null);
    const [tooltipCoords, setTooltipCoords] = useState(null);

    useEffect(() => {
        const handleOutsideClick = () => {
            setActiveTooltipId(null);
            setTooltipCoords(null);
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="border-b border-primary/10 dark:border-primary/20 text-center font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider text-xs">
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-left">Lote</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Fecha Clasif.</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">ASS</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">AS</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">Pajarito</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">Impureza</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">Total</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-right">% Pérdida</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={9} className="text-center py-10">Cargando comercialización...</td>
                        </tr>
                    ) : lotes.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="text-center py-10 text-text-secondary">No se encontraron lotes para este período.</td>
                        </tr>
                    ) : (
                        lotes.map((l) => {
                            const com = l.LoteComercializacionCvs?.[0] || null;
                            const hasCom = !!com;
                            const isSeco = l.estado === 'SECO';

                            return (
                                <tr
                                    key={l.id_control_lote_cv}
                                    className={`border-b border-primary/[0.06] transition-colors text-center text-text-primary dark:text-background-light font-medium ${
                                        !isSeco 
                                            ? 'opacity-50 bg-slate-50/50 dark:bg-slate-900/10' 
                                            : 'hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05]'
                                    }`}
                                >
                                    <td className="px-4 py-3 text-left font-bold text-primary">{l.lote}</td>
                                    <td className="px-4 py-3">{hasCom ? formatDate(com.fecha_clasificacion) : '—'}</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{hasCom ? formatDecimal(com.ass) : '0.00'}</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{hasCom ? formatDecimal(com.as) : '0.00'}</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{hasCom ? formatDecimal(com.pajarito) : '0.00'}</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{hasCom ? formatDecimal(com.impureza) : '0.00'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-primary tabular-nums">{hasCom ? formatDecimal(com.total) : '0.00'}</td>
                                    <td 
                                        className={`px-4 py-3 text-right font-bold tabular-nums ${
                                            hasCom && parseFloat(com.porcentaje_perdida) > 3
                                                ? 'text-red-600 dark:text-red-400 bg-red-500/10'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-end gap-1.5">
                                            {hasCom && parseFloat(com.porcentaje_perdida) > 3 && (
                                                <div className="relative inline-block text-left">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (activeTooltipId === l.id_control_lote_cv) {
                                                                setActiveTooltipId(null);
                                                                setTooltipCoords(null);
                                                            } else {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setActiveTooltipId(l.id_control_lote_cv);
                                                                setTooltipCoords({
                                                                    top: rect.top + window.scrollY,
                                                                    left: rect.left + window.scrollX + rect.width / 2
                                                                });
                                                            }
                                                        }}
                                                        className="material-symbols-outlined text-sm text-red-600 dark:text-red-400 font-bold select-none cursor-pointer hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-0.5 rounded-full hover:bg-red-500/20 outline-none"
                                                    >
                                                        info
                                                    </button>
                                                </div>
                                            )}
                                            <span>{hasCom ? formatDecimal(com.porcentaje_perdida) : '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center">
                                            {isSeco ? (
                                                <button
                                                    onClick={() => onOpenRegisterModal(l, com)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-white text-xs font-bold hover:bg-primary-dark cursor-pointer active:scale-95 transition-all shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-xs">edit_note</span>
                                                    {hasCom ? 'Editar' : 'Registrar'}
                                                </button>
                                            ) : (
                                                <span 
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary/60 uppercase tracking-wider"
                                                    title="Este lote debe marcarse como seco para registrar comercialización"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">lock</span>
                                                    Bloqueado
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {activeTooltipId && tooltipCoords && createPortal(
                <div 
                    style={{
                        position: 'absolute',
                        top: `${tooltipCoords.top - 8}px`,
                        left: `${tooltipCoords.left}px`,
                        transform: 'translate(-50%, -100%)',
                    }}
                    className="z-[9999] w-48 p-2.5 bg-white dark:bg-slate-900 border border-red-500/30 dark:border-red-500/50 rounded-xl shadow-xl text-left text-xs font-medium text-text-primary dark:text-background-light animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between gap-1 mb-1 border-b border-primary/5 pb-1">
                        <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1 text-[10px] tracking-wide uppercase">
                            <span className="material-symbols-outlined text-[13px] font-bold">warning</span>
                            Pérdida Excedida
                        </span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltipId(null);
                                setTooltipCoords(null);
                            }}
                            className="text-text-secondary hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                    </div>
                    <p className="text-[10px] leading-relaxed text-text-secondary/90 dark:text-background-light/80">
                        El porcentaje supera el límite esperado (3). Revise el lote físico.
                    </p>
                    <div className="absolute left-1/2 top-full w-2 h-2 bg-white dark:bg-slate-900 border-r border-b border-red-500/30 dark:border-red-500/50 rotate-45 -translate-x-1/2 -translate-y-1"></div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ComercializacionCvTable;
