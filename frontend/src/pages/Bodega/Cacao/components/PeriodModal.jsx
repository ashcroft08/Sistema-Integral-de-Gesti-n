import React from 'react';

/**
 * PeriodModal - Reusable unified modal form for creating or editing purchase periods.
 */
const PeriodModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    subtitle,
    icon = 'calendar_add_on',
    name,
    setName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    description,
    setDescription,
    submitLabel = 'Guardar'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
            <form
                onSubmit={onSubmit}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                        <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                            {title}
                        </h3>
                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 my-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                            Nombre del Trimestre *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: 2026 - Trimestre 1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                Fecha Inicio *
                            </label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                Fecha Fin *
                            </label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                            Descripción / Notas
                        </label>
                        <textarea
                            placeholder="Notas adicionales sobre este trimestre..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PeriodModal;
