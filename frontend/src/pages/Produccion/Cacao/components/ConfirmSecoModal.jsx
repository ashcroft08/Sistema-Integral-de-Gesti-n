import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmSecoModal = ({ isOpen, onClose, onConfirm, lote }) => {
    if (!isOpen || !lote) return null;

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141416] border border-red-500/20 dark:border-red-500/30 shadow-2xl p-6 transition-all duration-300 scale-in">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                    <span className="material-symbols-outlined text-4xl">warning</span>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                            ¿Confirmar cambio a SECO?
                        </h3>
                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                            Lote: <span className="font-bold text-primary">{lote.lote}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-sm text-red-700 dark:text-red-400">
                    <p className="font-semibold mb-1">¡Advertencia Importante!</p>
                    <p className="text-xs leading-relaxed">
                        Esta acción es <span className="font-bold uppercase">permanente</span> y no se podrá revertir. Una vez que el lote sea clasificado como <span className="font-bold">SECO</span>, no podrá regresar a ningún estado anterior.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 font-semibold text-sm">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-primary/20 dark:border-primary/30 rounded-xl text-text-secondary hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(lote);
                            onClose();
                        }}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-600/10"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">wb_sunny</span>
                        Sí, Cambiar a Seco
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmSecoModal;
