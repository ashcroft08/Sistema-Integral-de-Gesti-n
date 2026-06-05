import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ComercializacionCvModal = ({
    isOpen,
    onClose,
    lote,
    comercializacion,
    onSave
}) => {
    const [fechaClasificacion, setFechaClasificacion] = useState('');
    const [ass, setAss] = useState('0');
    const [asVal, setAsVal] = useState('0');
    const [pajarito, setPajarito] = useState('0');
    const [impureza, setImpureza] = useState('0');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (comercializacion) {
                setFechaClasificacion(comercializacion.fecha_clasificacion || '');
                setAss(String(comercializacion.ass || 0));
                setAsVal(String(comercializacion.as || 0));
                setPajarito(String(comercializacion.pajarito || 0));
                setImpureza(String(comercializacion.impureza || 0));
            } else {
                const today = new Date().toISOString().split('T')[0];
                setFechaClasificacion(today);
                setAss('0');
                setAsVal('0');
                setPajarito('0');
                setImpureza('0');
            }
        }
    }, [isOpen, comercializacion]);

    if (!isOpen || !lote) return null;

    const nAss = parseFloat(ass) || 0;
    const nAs = parseFloat(asVal) || 0;
    const nPajarito = parseFloat(pajarito) || 0;
    const nImpureza = parseFloat(impureza) || 0;
    
    const total = nAss + nAs + nPajarito + nImpureza;
    const cantidadLibra = parseFloat(lote.cantidad_libra) || 0;

    // exact division formula: cantidadLibra / total
    const porcentajePerdida = total > 0 ? (cantidadLibra / total).toFixed(2) : '0.00';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (nAss < 0 || nAs < 0 || nPajarito < 0 || nImpureza < 0) {
            alert('Los valores de clasificación no pueden ser negativos.');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                id_control_lote_cv: lote.id_control_lote_cv,
                id_periodo_compra: lote.id_periodo_compra,
                fecha_clasificacion: fechaClasificacion,
                ass: nAss,
                as: nAs,
                pajarito: nPajarito,
                impureza: nImpureza,
                total: total,
                porcentaje_perdida: parseFloat(porcentajePerdida)
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al guardar la clasificación');
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-background-dark border border-primary/10 dark:border-primary/20 shadow-2xl p-6 hover:shadow-primary/5 transition-all duration-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/10">
                    <h3 className="text-lg font-bold text-text-primary dark:text-background-light flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">layers</span>
                        Clasificación de Lote Comercial Convencional
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="bg-primary/[0.03] dark:bg-primary/[0.06] rounded-xl p-4 mb-4 border border-primary/10">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-text-secondary/70 block text-xs">Lote</span>
                            <span className="font-bold text-primary">{lote.lote}</span>
                        </div>
                        <div>
                            <span className="text-text-secondary/70 block text-xs">Cantidad Libra Original</span>
                            <span className="font-bold text-text-primary dark:text-background-light">{cantidadLibra.toLocaleString()} Lbs</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider mb-1">
                            Fecha Clasificación
                        </label>
                        <input
                            type="date"
                            required
                            value={fechaClasificacion}
                            onChange={(e) => setFechaClasificacion(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-primary/20 dark:border-primary/40 bg-white dark:bg-background-dark text-text-primary dark:text-background-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider mb-1">
                                ASS
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={ass}
                                onChange={(e) => setAss(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 dark:border-primary/40 bg-white dark:bg-background-dark text-text-primary dark:text-background-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider mb-1">
                                AS
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={asVal}
                                onChange={(e) => setAsVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 dark:border-primary/40 bg-white dark:bg-background-dark text-text-primary dark:text-background-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider mb-1">
                                Pajarito
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={pajarito}
                                onChange={(e) => setPajarito(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 dark:border-primary/40 bg-white dark:bg-background-dark text-text-primary dark:text-background-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider mb-1">
                                Impureza
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={impureza}
                                onChange={(e) => setImpureza(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-primary/20 dark:border-primary/40 bg-white dark:bg-background-dark text-text-primary dark:text-background-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary/10 bg-primary/[0.01] p-3 rounded-lg">
                        <div className="text-center">
                            <span className="block text-[10px] font-bold text-text-secondary/70 uppercase tracking-wider">Total Clasificación</span>
                            <span className="text-lg font-bold text-primary tabular-nums">{total.toFixed(2)}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-[10px] font-bold text-text-secondary/70 uppercase tracking-wider">% Pérdida</span>
                            <span className={`text-lg font-bold tabular-nums flex items-center justify-center gap-1 ${
                                parseFloat(porcentajePerdida) > 3 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                {porcentajePerdida}
                            </span>
                            {parseFloat(porcentajePerdida) > 3 && (
                                <span className="block text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                                    ⚠️ Pérdida mayor a 3. Revise lote físico.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-primary/25 rounded-lg text-sm text-text-primary dark:text-background-light hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-md cursor-pointer disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Guardando...' : 'Guardar Clasificación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ComercializacionCvModal;
