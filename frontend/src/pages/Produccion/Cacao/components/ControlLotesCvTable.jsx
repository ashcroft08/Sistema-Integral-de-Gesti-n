import React, { useState } from 'react';

const ControlLotesCvTable = ({
    lotes,
    loading,
    rutasCompra = [],
    formatDate,
    formatDecimal,
    formatCurrency,
    onUpdateOdp,
    onUpdateRuta,
    onMarkSeco
}) => {
    const [editingId, setEditingId] = useState(null);
    const [odpValue, setOdpValue] = useState('');

    const [editingRutaId, setEditingRutaId] = useState(null);
    const [rutaValue, setRutaValue] = useState('');

    const handleStartEdit = (lote) => {
        setEditingId(lote.id_control_lote_org || lote.id_control_lote_cv);
        setOdpValue(lote.odp || '');
    };

    const handleSaveOdp = async (lote) => {
        const cleanOdp = odpValue.trim();
        if (cleanOdp === lote.odp) {
            setEditingId(null);
            return;
        }

        await onUpdateOdp(lote.id_control_lote_org || lote.id_control_lote_cv, cleanOdp);
        setEditingId(null);
    };

    const handleStartEditRuta = (lote) => {
        setEditingRutaId(lote.id_control_lote_org || lote.id_control_lote_cv);
        setRutaValue(lote.id_ruta_compra || '');
    };

    const handleSaveRuta = async (lote) => {
        const routeId = rutaValue === '' ? null : parseInt(rutaValue, 10);
        if (routeId === lote.id_ruta_compra) {
            setEditingRutaId(null);
            return;
        }

        await onUpdateRuta(lote.id_control_lote_org || lote.id_control_lote_cv, routeId);
        setEditingRutaId(null);
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
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Clasificado</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="text-center py-10">Cargando control de lotes...</td>
                        </tr>
                    ) : lotes.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-10 text-text-secondary">No se encontraron lotes para este período.</td>
                        </tr>
                    ) : (
                        lotes.map((l) => (
                            <tr key={l.id_control_lote_org || l.id_control_lote_cv} className="border-b border-primary/[0.06] hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors text-center text-text-primary dark:text-background-light font-medium">
                                <td className="px-4 py-3">
                                    {editingId === (l.id_control_lote_org || l.id_control_lote_cv) ? (
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
                                <td className="px-4 py-3">{formatDate(l.fecha_ingreso)}</td>
                                <td className="px-4 py-3 text-left">
                                    {editingRutaId === (l.id_control_lote_org || l.id_control_lote_cv) ? (
                                        <div className="flex items-center justify-start gap-1">
                                            <select
                                                value={rutaValue}
                                                onChange={(e) => setRutaValue(e.target.value)}
                                                className="w-36 px-2 py-0.5 text-xs rounded border border-primary/30 dark:border-primary/50 bg-white dark:bg-background-dark text-text-primary dark:text-background-light outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {rutasCompra && rutasCompra.map(r => (
                                                    <option key={r.id_ruta_compra} value={r.id_ruta_compra}>
                                                        {r.ruta_compra}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleSaveRuta(l)}
                                                className="p-0.5 bg-emerald-500/10 text-emerald-600 rounded hover:bg-emerald-500/20 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-xs">done</span>
                                            </button>
                                            <button
                                                onClick={() => setEditingRutaId(null)}
                                                className="p-0.5 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-xs">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-start gap-1.5 group/ruta">
                                            <span className={`text-xs ${l.id_ruta_compra ? 'font-medium text-text-primary dark:text-background-light' : 'text-text-secondary/50'}`}>
                                                {l.RutaCompra?.ruta_compra || (rutasCompra.find(r => r.id_ruta_compra === l.id_ruta_compra)?.ruta_compra) || 'Sin Asignar'}
                                            </span>
                                            <button
                                                onClick={() => handleStartEditRuta(l)}
                                                className="p-0.5 hover:bg-primary/10 rounded text-text-secondary hover:text-primary transition-colors cursor-pointer"
                                                title="Asignar Ruta"
                                            >
                                                <span className="material-symbols-outlined text-xs">edit</span>
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatDecimal(l.cantidad_libra)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{formatCurrency(l.costo)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border select-none ${
                                                l.estado === 'SECO'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                : l.estado === 'ESCURRIDO'
                                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                                : l.estado === 'FERMENTADO'
                                                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                            }`}
                                        >
                                            {l.estado === 'SECO'
                                                ? 'Seco'
                                                : l.estado === 'ESCURRIDO'
                                                ? 'Escurrido'
                                                : l.estado === 'FERMENTADO'
                                                ? 'Fermentado'
                                                : l.estado || 'Húmedo'}
                                        </span>
                                        {l.estado !== 'SECO' && (
                                            <button
                                                onClick={() => onMarkSeco(l)}
                                                className="p-1 hover:bg-emerald-500/10 rounded text-emerald-600 transition-colors cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
                                                title="Marcar como Seco (Permanente)"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">wb_sunny</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border select-none ${
                                            l.clasificado
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                : 'bg-red-500/10 text-red-600 border-red-500/30'
                                        }`}>
                                            {l.clasificado ? 'SI' : 'NO'}
                                        </span>
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
