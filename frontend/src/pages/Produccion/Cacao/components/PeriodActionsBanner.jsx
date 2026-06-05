import React from 'react';

const PeriodActionsBanner = ({
    isApproved,
    total,
    periodName,
    loading,
    onClear,
    onApprove
}) => {
    if (isApproved) {
        return (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 rounded-2xl border border-primary/20 dark:border-primary/45 bg-primary/5 dark:bg-primary/10 p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-accent">
                        <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-primary dark:text-accent leading-tight">
                            Trimestre Aprobado y Guardado en el Historial
                        </h4>
                        <p className="text-xs text-text-secondary dark:text-background-light/60 mt-1 leading-relaxed">
                            Este período de compras ha sido revisado, aprobado y archivado en el registro histórico oficial. Para asegurar que la información no se altere, se encuentra <strong className="font-bold">bloqueado</strong> para nuevas cargas, modificaciones o eliminaciones.
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0 self-end md:self-center flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/25 rounded-xl text-primary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm font-bold">lock</span>
                    Trimestre Cerrado
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <span className="material-symbols-outlined text-2xl font-bold">info</span>
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 leading-tight">
                        Borrador de Compras (Revisión Pendiente)
                    </h4>
                    <p className="text-xs text-amber-700/90 dark:text-amber-500/80 mt-1 leading-relaxed">
                        Las compras de este trimestre han sido pre-cargadas de forma temporal. Por favor, revisa el listado inferior. Si la información es correcta, haz clic en <strong className="font-bold">"Aprobar y Guardar de forma Permanente"</strong> para registrar los datos formalmente.
                    </p>
                </div>
            </div>
            <div className="flex-shrink-0 self-end md:self-center flex flex-wrap items-center gap-3">
                <button
                    onClick={onClear}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-[1.02] shadow-sm hover:shadow transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-lg">delete_sweep</span>
                    Limpiar Trimestre
                </button>
                
                <button
                    onClick={onApprove}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20 hover:shadow-primary/30 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    Aprobar y Guardar de forma Permanente
                </button>
            </div>
        </div>
    );
};

export default PeriodActionsBanner;
