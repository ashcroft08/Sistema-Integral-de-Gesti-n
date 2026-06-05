import React, { useState, useRef } from 'react';

const ExcelUploadZone = ({ onFileSelect, periodName }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSelect(file);
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSelect(file);
        }
        e.target.value = '';
    };

    const validateAndSelect = (file) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            return;
        }
        onFileSelect(file);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden mb-6 ${
                isDragOver
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01] shadow-lg shadow-primary/10'
                    : 'border-primary/20 dark:border-primary/30 bg-white/50 dark:bg-background-dark/40 hover:border-primary/40 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.08] hover:shadow-md'
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] dark:from-primary/[0.05] dark:to-accent/[0.05] pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center py-12 px-6">
                <div className={`flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-all duration-300 ${
                    isDragOver
                        ? 'bg-primary/15 dark:bg-primary/25 scale-110'
                        : 'bg-primary/5 dark:bg-primary/10 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:scale-105'
                }`}>
                    <span className={`material-symbols-outlined text-5xl transition-colors duration-300 ${
                        isDragOver
                            ? 'text-primary dark:text-accent'
                            : 'text-primary/40 dark:text-primary/50 group-hover:text-primary/70'
                    }`}>
                        upload_file
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-text-primary dark:text-background-light mb-1 text-center">
                    {isDragOver ? 'Suelta tu archivo aquí' : `Arrastra tu Excel de compras para ${periodName}`}
                </h3>
                <p className="text-sm text-text-secondary dark:text-background-light/40 mb-5">
                    o
                </p>
                <div
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
                >
                    <span className="material-symbols-outlined text-lg">folder_open</span>
                    Seleccionar Archivo
                </div>
                <p className="text-xs text-text-secondary/60 dark:text-background-light/30 mt-4">
                    Formatos soportados: <span className="font-medium">.xlsx</span>, <span className="font-medium">.xls</span>
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
            />
        </div>
    );
};

export default ExcelUploadZone;
