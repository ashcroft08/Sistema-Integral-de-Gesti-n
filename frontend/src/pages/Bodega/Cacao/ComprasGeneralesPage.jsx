import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../../../components/Layout/ModuleLayout';
import { useComprasGenerales } from '../../../hooks/useComprasGenerales';

const ComprasGeneralesPage = ({ onBack }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // UI modals / states
    const [isDragOver, setIsDragOver] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false);
    const [showImportBanner, setShowImportBanner] = useState(true);

    // Form states for creating a new Period
    const [newPeriodName, setNewPeriodName] = useState('');
    const [newPeriodStart, setNewPeriodStart] = useState('');
    const [newPeriodEnd, setNewPeriodEnd] = useState('');
    const [newPeriodDesc, setNewPeriodDesc] = useState('');

    // Form states for editing an existing Period
    const [showEditPeriodModal, setShowEditPeriodModal] = useState(false);
    const [editPeriodName, setEditPeriodName] = useState('');
    const [editPeriodStart, setEditPeriodStart] = useState('');
    const [editPeriodEnd, setEditPeriodEnd] = useState('');
    const [editPeriodDesc, setEditPeriodDesc] = useState('');

    const {
        compras,
        total,
        pagina,
        totalPaginas,
        loading,
        uploading,
        uploadProgress,
        uploadResult,
        fetchCompras,
        uploadFile,
        clearData,

        // Period properties from hook
        periodos,
        selectedPeriod,
        setSelectedPeriod,
        loadingPeriodos,
        resumenPeriodo,
        fetchPeriodos,
        createPeriodo,
        deletePeriodo,
        updatePeriodo,
    } = useComprasGenerales();

    // Load periods on mount
    useEffect(() => {
        fetchPeriodos();
    }, [fetchPeriodos]);

    // Load compras when selected period changes
    useEffect(() => {
        if (selectedPeriod) {
            fetchCompras(1, 20, selectedPeriod);
            setShowImportBanner(true); // Reset banner for new period
        }
    }, [selectedPeriod, fetchCompras]);

    // Get current period object details
    const activePeriodObj = periodos.find(p => p.id_periodo_compra === parseInt(selectedPeriod, 10));

    // ─── File handling ───
    const handleFileSelect = useCallback((file) => {
        if (!file || !selectedPeriod) return;
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            return;
        }
        uploadFile(file, selectedPeriod);
    }, [uploadFile, selectedPeriod]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleInputChange = useCallback((e) => {
        const file = e.target.files?.[0];
        handleFileSelect(file);
        e.target.value = '';
    }, [handleFileSelect]);

    const handleDelete = async () => {
        if (!selectedPeriod) return;
        try {
            await clearData(selectedPeriod);
            setShowDeleteConfirm(false);
        } catch {
            // error already handled in hook
        }
    };

    const handleCreatePeriodSubmit = async (e) => {
        e.preventDefault();
        if (!newPeriodName || !newPeriodStart || !newPeriodEnd) return;
        try {
            await createPeriodo({
                nombre: newPeriodName,
                fecha_inicio: newPeriodStart,
                fecha_fin: newPeriodEnd,
                descripcion: newPeriodDesc
            });
            // Reset form
            setNewPeriodName('');
            setNewPeriodStart('');
            setNewPeriodEnd('');
            setNewPeriodDesc('');
            setShowCreatePeriodModal(false);
        } catch {
            // error already handled in hook
        }
    };

    const openEditPeriodModal = () => {
        if (!activePeriodObj) return;
        setEditPeriodName(activePeriodObj.nombre || '');
        
        // Helper to format dates correctly without timezone offsets
        const formatForInput = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            const userTimezoneOffset = d.getTimezoneOffset() * 60000;
            const normalizedDate = new Date(d.getTime() + userTimezoneOffset);
            return normalizedDate.toISOString().split('T')[0];
        };

        setEditPeriodStart(formatForInput(activePeriodObj.fecha_inicio));
        setEditPeriodEnd(formatForInput(activePeriodObj.fecha_fin));
        setEditPeriodDesc(activePeriodObj.descripcion || '');
        setShowEditPeriodModal(true);
    };

    const handleEditPeriodSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPeriod || !editPeriodName || !editPeriodStart || !editPeriodEnd) return;
        try {
            await updatePeriodo(selectedPeriod, {
                nombre: editPeriodName,
                fecha_inicio: editPeriodStart,
                fecha_fin: editPeriodEnd,
                descripcion: editPeriodDesc
            });
            setShowEditPeriodModal(false);
        } catch {
            // error already handled in hook
        }
    };

    // ─── Formatters ───
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        // Fix timezone offset for DateOnly
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const normalizedDate = new Date(d.getTime() + userTimezoneOffset);
        return normalizedDate.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0.00';
        return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    };

    // Render inner content of ComprasGenerales
    const renderContent = () => (
        <div className="space-y-6">
            {/* ═══════ BREADCRUMB ═══════ */}
            <nav className="flex items-center gap-2 text-sm mb-4">
                {onBack ? (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-primary/80 hover:text-primary font-bold transition-all cursor-pointer group"
                    >
                        <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        <span>Volver a Materia Prima</span>
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/bodega')}
                        className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">warehouse</span>
                        <span>Bodega</span>
                    </button>
                )}
                <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
                <span className="text-text-secondary/70 dark:text-background-light/50">Materia Prima Cacao</span>
                <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
                <span className="font-semibold text-text-primary dark:text-background-light">Compras Generales</span>
            </nav>

            {/* ═══════ HEADER ═══════ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary dark:text-background-light tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-primary font-bold">analytics</span>
                        Compras Generales por Periodos
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-background-light/50 mt-1">
                        Sube y administra archivos Excel de compras generales agrupados de forma limpia por trimestres o períodos.
                    </p>
                </div>
            </div>

            {/* ═══════ PERIOD SELECTION BAR ═══════ */}
            <div className="rounded-2xl border border-primary/15 bg-white/60 dark:bg-background-dark/45 dark:border-primary/25 backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-full sm:max-w-xs">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-2 px-1">
                            Selecciona el Trimestre o Periodo
                        </label>
                        <select
                            value={selectedPeriod || ''}
                            onChange={(e) => setSelectedPeriod(e.target.value ? parseInt(e.target.value, 10) : null)}
                            disabled={loadingPeriodos}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-white/80 dark:bg-background-dark/50 text-sm font-semibold text-text-primary dark:text-background-light px-3 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="">-- Selecciona un periodo --</option>
                            {periodos.map((p) => (
                                <option key={p.id_periodo_compra} value={p.id_periodo_compra}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {activePeriodObj && (
                        <div className="flex-1 self-end sm:self-center mt-2 sm:mt-5 p-2.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                            <p className="text-xs text-text-primary/95 dark:text-background-light/90 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                                <span className="font-bold">Duración:</span>
                                {formatDate(activePeriodObj.fecha_inicio)} al {formatDate(activePeriodObj.fecha_fin)}
                            </p>
                            {activePeriodObj.descripcion && (
                                <p className="text-[10px] text-text-secondary dark:text-background-light/40 mt-0.5 line-clamp-1 italic">
                                    "{activePeriodObj.descripcion}"
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-5">
                    <button
                        onClick={() => setShowCreatePeriodModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Crear Trimestre
                    </button>
                    
                    {selectedPeriod && activePeriodObj && (
                        <button
                            onClick={openEditPeriodModal}
                            className="inline-flex items-center justify-center w-10 h-10 text-primary dark:text-background-light/95 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white hover:scale-[1.02] transition-all cursor-pointer"
                            title="Editar información de este trimestre"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════ CREATE PERIOD MODAL ═══════ */}
            {showCreatePeriodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShowCreatePeriodModal(false)} />
                    <form
                        onSubmit={handleCreatePeriodSubmit}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                                <span className="material-symbols-outlined text-2xl text-primary">calendar_add_on</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                                    Nuevo Trimestre / Período
                                </h3>
                                <p className="text-xs text-text-secondary dark:text-background-light/50">
                                    Define los parámetros temporales para el reporte
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
                                    value={newPeriodName}
                                    onChange={(e) => setNewPeriodName(e.target.value)}
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
                                        value={newPeriodStart}
                                        onChange={(e) => setNewPeriodStart(e.target.value)}
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
                                        value={newPeriodEnd}
                                        onChange={(e) => setNewPeriodEnd(e.target.value)}
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
                                    value={newPeriodDesc}
                                    onChange={(e) => setNewPeriodDesc(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowCreatePeriodModal(false)}
                                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all"
                            >
                                Guardar Periodo
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ═══════ EDIT PERIOD MODAL ═══════ */}
            {showEditPeriodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShowEditPeriodModal(false)} />
                    <form
                        onSubmit={handleEditPeriodSubmit}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                                <span className="material-symbols-outlined text-2xl text-primary">edit_calendar</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                                    Editar Trimestre / Período
                                </h3>
                                <p className="text-xs text-text-secondary dark:text-background-light/50">
                                    Modifica los parámetros temporales o el nombre del reporte
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
                                    value={editPeriodName}
                                    onChange={(e) => setEditPeriodName(e.target.value)}
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
                                        value={editPeriodStart}
                                        onChange={(e) => setEditPeriodStart(e.target.value)}
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
                                        value={editPeriodEnd}
                                        onChange={(e) => setEditPeriodEnd(e.target.value)}
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
                                    value={editPeriodDesc}
                                    onChange={(e) => setEditPeriodDesc(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowEditPeriodModal(false)}
                                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ═══════ NO PERIOD SELECTED (EMPTY STATE) ═══════ */}
            {!selectedPeriod && (
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-5 animate-bounce duration-1000">
                        <span className="material-symbols-outlined text-5xl text-primary/40 dark:text-primary/50">calendar_month</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-background-light mb-1">
                        Selecciona o crea un Trimestre
                    </h3>
                    <p className="text-sm text-text-secondary/70 dark:text-background-light/40 max-w-md mx-auto mb-6">
                        Para poder subir archivos Excel y organizar tus compras generales por trimestres, primero debes seleccionar un período o crear uno nuevo.
                    </p>
                    <button
                        onClick={() => setShowCreatePeriodModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-lg">calendar_add_on</span>
                        Crear Primer Trimestre
                    </button>
                </div>
            )}

            {selectedPeriod && (
                <>
                    {/* ═══════ ACTIONS BAR (WHEN DATA LOADED) ═══════ */}
                    {total > 0 && !uploading && (
                        <div className="flex justify-end gap-2 mb-4">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                Limpiar Trimestre
                            </button>
                        </div>
                    )}

                    {/* ═══════ DELETE CONFIRMATION MODAL ═══════ */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30">
                                        <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">warning</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                                            ¿Limpiar compras de este periodo?
                                        </h3>
                                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                                            Esta acción solo afecta a {activePeriodObj?.nombre}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-text-primary/70 dark:text-background-light/60 mb-6">
                                    Se eliminarán los <span className="font-bold text-red-600 dark:text-red-400">{total}</span> registros de compras generales en el periodo <span className="font-semibold">{activePeriodObj?.nombre}</span>. Los demás periodos no se verán afectados.
                                </p>
                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="px-5 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Eliminando...' : 'Sí, limpiar periodo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ UPLOAD ZONE (ONLY SHOW IF NO DATA AND NOT LOADING) ═══════ */}
                    {!loading && !uploading && total === 0 && compras.length === 0 && !uploadResult && (
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
                                    {isDragOver ? 'Suelta tu archivo aquí' : `Arrastra tu Excel de compras para ${activePeriodObj?.nombre}`}
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
                    )}

                    {/* ═══════ UPLOAD PROGRESS ═══════ */}
                    {uploading && (
                        <div className="rounded-2xl border border-primary/20 dark:border-primary/30 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-8 mb-6">
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
                                        Por favor espera mientras aplicamos el proceso ETL a {activePeriodObj?.nombre}
                                    </p>
                                </div>
                                <div className="w-full max-w-md">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-text-secondary dark:text-background-light/50">Progreso</span>
                                        <span className="font-bold text-primary dark:text-accent">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-primary/10 dark:bg-primary/20 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] transition-[width] duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ ETL SUCCESS BANNER ═══════ */}
                    {uploadResult && !uploading && showImportBanner && (
                        <div className="mb-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                            ¡Excel Importado y Normalizado con Éxito!
                                        </h4>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-500/80 mt-0.5">
                                            Se procesaron **{(uploadResult.totalFilasExcel ?? uploadResult.total_filas_excel ?? 0)}** filas en el trimestre.
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-emerald-800/70 dark:text-emerald-500/60 font-bold">
                                            <span>✓ Insertadas: {(uploadResult.filasInsertadas ?? uploadResult.filas_insertadas ?? 0)}</span>
                                            <span>· ✖ Duplicados omitidos: {(uploadResult.duplicadosEliminados ?? uploadResult.duplicados_eliminados ?? 0)}</span>
                                            <span>· ✍ Rellenadas con ETL: {(uploadResult.camposRellenados ?? uploadResult.campos_rellenados ?? 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowImportBanner(false)}
                                    className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg p-1.5 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg font-bold">close</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════ METRIC & SUMMARY CARDS ═══════ */}
                    {total > 0 && !uploading && (
                        <div className="mb-6 space-y-4">
                            {/* Information alert about correct ETL process flow */}
                            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] p-4 flex items-start gap-3.5 shadow-sm animate-in slide-in-from-top-2 duration-300">
                                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <span className="material-symbols-outlined text-2xl font-bold">info</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 leading-tight">
                                        Período con compras activas
                                    </h4>
                                    <p className="text-xs text-amber-700/90 dark:text-amber-500/80 mt-1 leading-relaxed">
                                        Este trimestre ya contiene registros procesados y normalizados. Si necesitas reemplazar la información con un nuevo archivo Excel, primero debes eliminar los datos actuales haciendo clic en el botón <strong className="font-bold text-amber-800 dark:text-amber-300">"Limpiar Trimestre"</strong> (ubicado arriba a la derecha) para poder habilitar la zona de carga de nuevo.
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-background-light/60 px-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">monitoring</span>
                                Métricas Acumuladas ({activePeriodObj?.nombre})
                            </h3>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        icon: 'shopping_basket',
                                        value: total,
                                        label: 'Total de Compras',
                                        color: 'text-blue-600 dark:text-blue-400',
                                        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
                                        border: 'border-blue-200/50 dark:border-blue-800/30',
                                        suffix: ' compras'
                                    },
                                    {
                                        icon: 'scale',
                                        value: resumenPeriodo?.totalCantidad ?? 0,
                                        label: 'Volumen Cacao',
                                        color: 'text-emerald-600 dark:text-emerald-400',
                                        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                                        border: 'border-emerald-200/50 dark:border-emerald-800/30',
                                        suffix: ' Lb / Qq'
                                    },
                                    {
                                        icon: 'payments',
                                        value: formatCurrency(resumenPeriodo?.totalInversion ?? 0),
                                        label: 'Monto Inversión',
                                        color: 'text-amber-600 dark:text-amber-400',
                                        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
                                        border: 'border-amber-200/50 dark:border-amber-800/30',
                                        isCurrency: true
                                    },
                                    {
                                        icon: 'price_change',
                                        value: formatCurrency(resumenPeriodo?.promedioValorUnitario ?? 0),
                                        label: 'Precio Promedio / Lb',
                                        color: 'text-purple-600 dark:text-purple-400',
                                        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
                                        border: 'border-purple-200/50 dark:border-purple-800/30',
                                        isCurrency: true
                                    },
                                ].map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border ${stat.border} bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg}`}>
                                                <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xl font-bold text-text-primary dark:text-background-light leading-none mb-1.5 tabular-nums">
                                                    {stat.isCurrency ? stat.value : stat.value.toLocaleString('es-EC')}
                                                </p>
                                                <p className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 truncate uppercase tracking-wider">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ═══════ DATA TABLE ═══════ */}
                    {(compras.length > 0 || loading) && (
                        <div className="rounded-2xl border border-primary/15 dark:border-primary/25 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm overflow-hidden shadow-sm">
                            {/* Table Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 dark:border-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-xl">table_chart</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-text-primary dark:text-background-light">
                                            Tabla de Registros ({activePeriodObj?.nombre})
                                        </h3>
                                        <p className="text-xs text-text-secondary dark:text-background-light/40">
                                            {total.toLocaleString('es-EC')} compras normalizadas
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-primary/[0.03] dark:bg-primary/[0.08]">
                                            {['#', 'Número', 'Fecha', 'Comunidad', 'Código', 'Proveedor', 'Categoría', 'Producto', 'Cantidad', 'V. Unitario', 'Total', 'Negociador'].map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 whitespace-nowrap"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/[0.06] dark:divide-primary/[0.12]">
                                        {loading && compras.length === 0 ? (
                                            <tr>
                                                <td colSpan={12} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 animate-pulse">
                                                            <span className="material-symbols-outlined text-2xl text-primary/40">hourglass_top</span>
                                                        </div>
                                                        <p className="text-sm text-text-secondary dark:text-background-light/40">Cargando compras...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            compras.map((compra, idx) => (
                                                <tr
                                                    key={compra.id_compra_general || idx}
                                                    className={`transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] ${
                                                        idx % 2 === 0
                                                            ? 'bg-transparent'
                                                            : 'bg-primary/[0.015] dark:bg-primary/[0.04]'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 text-xs font-mono text-text-secondary dark:text-background-light/40">
                                                        {(pagina - 1) * 20 + idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-text-primary dark:text-background-light whitespace-nowrap">
                                                        {compra.numero || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 whitespace-nowrap">
                                                        {formatDate(compra.fecha)}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 max-w-[160px] truncate">
                                                        {compra.comunidad || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-text-primary/70 dark:text-background-light/60">
                                                        {compra.codigo || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 max-w-[180px] truncate">
                                                        {compra.proveedor || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-primary/70 dark:text-background-light/60">
                                                        {compra.categoria || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-primary/80 dark:text-background-light/70 max-w-[160px] truncate">
                                                        {compra.producto || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-text-primary dark:text-background-light tabular-nums">
                                                        {compra.cantidad ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                                                        {formatCurrency(compra.valor_unitario)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                                        {formatCurrency(compra.total)}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-primary/70 dark:text-background-light/60 max-w-[140px] truncate">
                                                        {compra.negociador || '—'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* ═══════ PAGINATION ═══════ */}
                            {totalPaginas > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-primary/10 dark:border-primary/20">
                                    <p className="text-xs text-text-secondary dark:text-background-light/40">
                                        Página <span className="font-bold text-text-primary dark:text-background-light">{pagina}</span> de{' '}
                                        <span className="font-bold text-text-primary dark:text-background-light">{totalPaginas}</span>
                                        {' · '}{total.toLocaleString('es-EC')} registros
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => fetchCompras(1, 20, selectedPeriod)}
                                            disabled={pagina <= 1 || loading}
                                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-lg">first_page</span>
                                        </button>
                                        <button
                                            onClick={() => fetchCompras(pagina - 1, 20, selectedPeriod)}
                                            disabled={pagina <= 1 || loading}
                                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                                        </button>

                                        {/* Page numbers */}
                                        {(() => {
                                            const pages = [];
                                            let start = Math.max(1, pagina - 2);
                                            let end = Math.min(totalPaginas, pagina + 2);
                                            if (pagina <= 3) end = Math.min(5, totalPaginas);
                                            if (pagina >= totalPaginas - 2) start = Math.max(1, totalPaginas - 4);

                                            for (let i = start; i <= end; i++) {
                                                pages.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => fetchCompras(i, 20, selectedPeriod)}
                                                        disabled={loading}
                                                        className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                                            i === pagina
                                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                                : 'border border-primary/15 dark:border-primary/25 text-text-primary/60 dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary'
                                                        }`}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                            return pages;
                                        })()}

                                        <button
                                            onClick={() => fetchCompras(pagina + 1, 20, selectedPeriod)}
                                            disabled={pagina >= totalPaginas || loading}
                                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                        </button>
                                        <button
                                            onClick={() => fetchCompras(totalPaginas, 20, selectedPeriod)}
                                            disabled={pagina >= totalPaginas || loading}
                                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/15 dark:border-primary/25 text-text-secondary dark:text-background-light/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-lg">last_page</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════ EMPTY PERIOD STATE ═══════ */}
                    {!loading && compras.length === 0 && !uploading && !uploadResult && (
                        <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-4 text-primary">
                                <span className="material-symbols-outlined text-4xl">folder_zip</span>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary/60 dark:text-background-light/40 mb-1">
                                Período sin compras cargadas
                            </h3>
                            <p className="text-sm text-text-secondary/60 dark:text-background-light/30 max-w-md mx-auto">
                                Arrastra tu archivo Excel en la zona de arriba para procesar y normalizar las compras generales de {activePeriodObj?.nombre}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (onBack) {
        return renderContent();
    }

    return (
        <ModuleLayout moduleName="Módulo de Bodega" moduleIcon="warehouse">
            {renderContent()}
        </ModuleLayout>
    );
};

export default ComprasGeneralesPage;
