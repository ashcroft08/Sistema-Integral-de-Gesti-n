import React from 'react';

const ETLProgressCard = ({ progress, periodName }) => {
    return (
        <div className="rounded-2xl border border-primary/20 dark:border-primary/30 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-8 mb-6 animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 animate-pulse">
                        <span className="material-symbols-outlined text-4xl text-primary dark:text-accent">cloud_upload</span>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-background-light mb-1">
                        Procesando y Normalizando...
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-background-light/50">
                        Por favor espera mientras aplicamos el proceso ETL a {periodName}
                    </p>
                </div>
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-text-secondary dark:text-background-light/50">Progreso</span>
                        <span className="font-bold text-primary dark:text-accent">{progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-primary/10 dark:bg-primary/20 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] transition-[width] duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ETLProgressCard;
