import React from 'react';

/**
 * Componente Breadcrumbs reutilizable para estandarizar las migas de pan en el módulo de Cacao.
 */
const Breadcrumbs = ({ onBack, currentPath }) => {
    return (
        <nav className="flex items-center gap-2 text-sm mb-4">
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none font-medium"
            >
                <span className="material-symbols-outlined text-base">precision_manufacturing</span>
                <span>Producción</span>
            </button>
            <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
            <span className="text-text-secondary/70 dark:text-background-light/50 font-medium">Materia Prima Cacao</span>
            <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
            <span className="font-semibold text-text-primary dark:text-background-light">{currentPath}</span>
        </nav>
    );
};

export default Breadcrumbs;
