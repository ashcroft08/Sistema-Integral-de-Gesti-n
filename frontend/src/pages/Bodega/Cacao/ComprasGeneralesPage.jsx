import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../../../components/Layout/ModuleLayout';
import { useComprasGenerales } from '../../../hooks/useComprasGenerales';
import MetricCardSplit from './components/MetricCardSplit';
import PeriodModal from './components/PeriodModal';
import PurchaseTable from './components/PurchaseTable';
import Breadcrumbs from './components/Breadcrumbs';

const ComprasGeneralesPage = ({ onBack }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // UI modals / states
    const [isDragOver, setIsDragOver] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false);
    const [showImportBanner, setShowImportBanner] = useState(true);
    const [showDetailView, setShowDetailView] = useState(false);

    // Form states for creating a new Period
    const [newPeriodName, setNewPeriodName] = useState('');
    const [newPeriodStart, setNewPeriodStart] = useState('');
    const [newPeriodEnd, setNewPeriodEnd] = useState('');
    const [newPeriodDesc, setNewPeriodDesc] = useState('');
    const [newPeriodTrimestre, setNewPeriodTrimestre] = useState('');
    const [newPeriodAnio, setNewPeriodAnio] = useState('');

    // Form states for editing an existing Period
    const [showEditPeriodModal, setShowEditPeriodModal] = useState(false);
    const [editPeriodName, setEditPeriodName] = useState('');
    const [editPeriodStart, setEditPeriodStart] = useState('');
    const [editPeriodEnd, setEditPeriodEnd] = useState('');
    const [editPeriodDesc, setEditPeriodDesc] = useState('');
    const [editPeriodTrimestre, setEditPeriodTrimestre] = useState('');
    const [editPeriodAnio, setEditPeriodAnio] = useState('');

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
        approvePeriodo,
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

    // Auto-hide upload success banner after 15 seconds
    useEffect(() => {
        if (uploadResult) {
            setShowImportBanner(true);
            const timer = setTimeout(() => {
                setShowImportBanner(false);
            }, 15000); // 15 seconds
            return () => clearTimeout(timer);
        }
    }, [uploadResult]);

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

    const handleApprove = async () => {
        if (!selectedPeriod) return;
        try {
            await approvePeriodo(selectedPeriod);
            setShowApproveConfirm(false);
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
                descripcion: newPeriodDesc,
                trimestre: newPeriodTrimestre ? parseInt(newPeriodTrimestre, 10) : undefined,
                anio: newPeriodAnio ? parseInt(newPeriodAnio, 10) : undefined
            });
            // Reset form
            setNewPeriodName('');
            setNewPeriodStart('');
            setNewPeriodEnd('');
            setNewPeriodDesc('');
            setNewPeriodTrimestre('');
            setNewPeriodAnio('');
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
        setEditPeriodTrimestre(activePeriodObj.trimestre || '');
        setEditPeriodAnio(activePeriodObj.anio || '');
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
                descripcion: editPeriodDesc,
                trimestre: editPeriodTrimestre ? parseInt(editPeriodTrimestre, 10) : null,
                anio: editPeriodAnio ? parseInt(editPeriodAnio, 10) : null
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

    const renderTable = () => (
        <PurchaseTable
            compras={compras}
            total={total}
            pagina={pagina}
            totalPaginas={totalPaginas}
            loading={loading}
            selectedPeriod={selectedPeriod}
            activePeriodObj={activePeriodObj}
            fetchCompras={fetchCompras}
            formatDate={formatDate}
        />
    );

    const renderDetailView = () => (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* ═══════ BREADCRUMB ═══════ */}
            <nav className="flex items-center gap-2 text-sm mb-4">
                <button
                    onClick={onBack ? onBack : () => navigate('/bodega')}
                    className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-base">warehouse</span>
                    <span>Bodega</span>
                </button>
                <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
                <span className="text-text-secondary/70 dark:text-background-light/50">Materia Prima Cacao</span>
                <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
                <button
                    onClick={() => setShowDetailView(false)}
                    className="text-text-secondary/70 hover:text-primary transition-colors cursor-pointer"
                >
                    Compras Generales
                </button>
                <span className="material-symbols-outlined text-xs text-text-secondary/50 dark:text-background-light/30">chevron_right</span>
                <span className="font-semibold text-text-primary dark:text-background-light">Listado Completo</span>
            </nav>

            {/* ═══════ HEADER ═══════ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary dark:text-background-light tracking-tight flex items-center gap-3">
                        <button
                            onClick={() => setShowDetailView(false)}
                            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 dark:border-primary/25 text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer group shadow-sm"
                            title="Regresar al Resumen"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform font-bold">arrow_back</span>
                        </button>
                        <span className="material-symbols-outlined text-3xl text-primary font-bold">list_alt</span>
                        Listado Detallado de Compras
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-background-light/50 mt-1">
                        Explora todos los registros del periodo <strong className="text-primary">{activePeriodObj?.nombre}</strong>.
                    </p>
                </div>
            </div>

            {/* Render table here */}
            {(compras.length > 0 || loading) ? renderTable() : (
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-4 text-primary">
                        <span className="material-symbols-outlined text-4xl">folder_zip</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary/60 dark:text-background-light/40 mb-1">
                        No hay datos en este trimestre
                    </h3>
                    <p className="text-sm text-text-secondary/60 dark:text-background-light/30 max-w-md mx-auto">
                        Regresa a la pantalla principal de resumen para poder subir tu archivo Excel.
                    </p>
                </div>
            )}
        </div>
    );

    // Render inner content of ComprasGenerales
    const renderContent = () => (
        <div className="space-y-6">
            {/* ═══════ BREADCRUMB ═══════ */}
            <Breadcrumbs onBack={onBack ? onBack : () => navigate('/bodega')} currentPath="Compras Generales" />

            {/* ═══════ HEADER ═══════ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary dark:text-background-light tracking-tight flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 dark:border-primary/25 text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer group shadow-sm"
                                title="Volver a Materia Prima"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform font-bold">arrow_back</span>
                            </button>
                        )}
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
                            Seleccionar Trimestre de Consulta
                        </label>
                        <select
                            value={selectedPeriod || ''}
                            onChange={(e) => setSelectedPeriod(e.target.value ? parseInt(e.target.value, 10) : null)}
                            disabled={loadingPeriodos}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-white/80 dark:bg-background-dark/50 text-sm font-semibold text-text-primary dark:text-background-light px-3 py-2.5 outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="">-- Elige un trimestre --</option>
                            {periodos.map((p) => (
                                <option key={p.id_periodo_compra} value={p.id_periodo_compra}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {activePeriodObj && (
                        <div className="flex-1 self-end sm:self-center mt-2 sm:mt-5 p-2.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                            <p className="text-xs text-text-primary/95 dark:text-background-light/90 flex flex-wrap items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                                <span className="font-bold">Duración:</span>
                                {formatDate(activePeriodObj.fecha_inicio)} al {formatDate(activePeriodObj.fecha_fin)}
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    activePeriodObj.estado === 'APROBADO'
                                        ? 'bg-primary/15 text-primary border border-primary/25'
                                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                }`}>
                                    <span className="material-symbols-outlined text-[10px] font-bold">
                                        {activePeriodObj.estado === 'APROBADO' ? 'lock' : 'lock_open'}
                                    </span>
                                    {activePeriodObj.estado}
                                </span>
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
            <PeriodModal
                isOpen={showCreatePeriodModal}
                onClose={() => setShowCreatePeriodModal(false)}
                onSubmit={handleCreatePeriodSubmit}
                title="Nuevo Trimestre / Período"
                subtitle="Define los parámetros temporales para el reporte"
                icon="calendar_add_on"
                name={newPeriodName}
                setName={setNewPeriodName}
                startDate={newPeriodStart}
                setStartDate={setNewPeriodStart}
                endDate={newPeriodEnd}
                setEndDate={setNewPeriodEnd}
                description={newPeriodDesc}
                setDescription={setNewPeriodDesc}
                submitLabel="Guardar Periodo"
            />

            {/* ═══════ EDIT PERIOD MODAL ═══════ */}
            <PeriodModal
                isOpen={showEditPeriodModal}
                onClose={() => setShowEditPeriodModal(false)}
                onSubmit={handleEditPeriodSubmit}
                title="Editar Trimestre / Período"
                subtitle="Modifica los parámetros temporales o el nombre del reporte"
                icon="edit_calendar"
                name={editPeriodName}
                setName={setEditPeriodName}
                startDate={editPeriodStart}
                setStartDate={setEditPeriodStart}
                endDate={editPeriodEnd}
                setEndDate={setEditPeriodEnd}
                description={editPeriodDesc}
                setDescription={setEditPeriodDesc}
                submitLabel="Guardar Cambios"
            />

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
                    {/* ═══════ ACTIONS & NOTICE BAR (WHEN DATA LOADED) ═══════ */}
                    {total > 0 && !uploading && (
                        activePeriodObj?.estado === 'APROBADO' ? (
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
                        ) : (
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
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-[1.02] shadow-sm hover:shadow transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                        Limpiar Trimestre
                                    </button>
                                    
                                    <button
                                        onClick={() => setShowApproveConfirm(true)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20 hover:shadow-primary/30 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-lg">verified_user</span>
                                        Aprobar y Guardar de forma Permanente
                                    </button>
                                </div>
                            </div>
                        )
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
                                            ¿Borrar compras temporales de este periodo?
                                        </h3>
                                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                                            Esta acción solo afecta a {activePeriodObj?.nombre}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-text-primary/70 dark:text-background-light/60 mb-6">
                                    Se eliminarán los <span className="font-bold text-red-600 dark:text-red-400">{total}</span> registros de compras temporales en el periodo <span className="font-semibold">{activePeriodObj?.nombre}</span>. Los demás periodos no se verán afectados.
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
                                        {loading ? 'Eliminando...' : 'Sí, borrar datos temporales'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ APPROVE CONFIRMATION MODAL ═══════ */}
                    {showApproveConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowApproveConfirm(false)} />
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                                        <span className="material-symbols-outlined text-2xl text-primary">verified_user</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                                            ¿Aprobar y cerrar el período de compras?
                                        </h3>
                                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                                            Guardar permanentemente en el historial para {activePeriodObj?.nombre}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-text-primary/70 dark:text-background-light/60 space-y-3 mb-6">
                                    <p>
                                        Esta acción guardará permanentemente en el registro histórico los <span className="font-bold text-primary">{total}</span> registros de compra cargados en este trimestre.
                                    </p>
                                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-400 font-medium">
                                        ⚠️ <strong>Importante:</strong> Una vez aprobado, este trimestre quedará cerrado y bloqueado de forma permanente. Ya no se podrán subir más archivos de Excel ni borrar la información actual.
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={() => setShowApproveConfirm(false)}
                                        className="px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={loading}
                                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando datos...' : 'Sí, Aprobar y Cerrar Trimestre'}
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
                                            ¡Archivo de Compras Cargado con Éxito!
                                        </h4>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-500/80 mt-0.5">
                                            Se ha procesado y registrado la información del archivo de Excel en el sistema.
                                        </p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-emerald-800/70 dark:text-emerald-500/60 font-bold">
                                            <span>✓ Nuevas compras registradas: {(uploadResult.filasInsertadas ?? uploadResult.filas_insertadas ?? 0)}</span>
                                            <span>· ✖ Compras duplicadas (evitadas): {(uploadResult.duplicadosEliminados ?? uploadResult.duplicados_eliminados ?? 0)}</span>
                                            <span>· ✍ Datos incompletos corregidos: {(uploadResult.camposRellenados ?? uploadResult.campos_rellenados ?? 0)}</span>
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
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-background-light/60 px-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">monitoring</span>
                                Métricas Acumuladas ({activePeriodObj?.nombre})
                            </h3>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* CARD 1: Total de Compras */}
                                <div className="rounded-xl border border-blue-200/50 dark:border-blue-800/30 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                                    <div className="flex items-center gap-4 h-full">
                                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                            <span className="material-symbols-outlined text-2xl">shopping_basket</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xl font-bold text-text-primary dark:text-background-light leading-none mb-1.5 tabular-nums">
                                                {total.toLocaleString('es-EC')}
                                            </p>
                                            <p className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 truncate uppercase tracking-wider">
                                                Total de Compras
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: Volumen Cacao */}
                                <MetricCardSplit
                                    title="Volumen Cacao"
                                    icon="scale"
                                    theme="emerald"
                                    leftLabel="Libras"
                                    leftValue={(resumenPeriodo?.totalCantidad ?? 0).toLocaleString('es-EC')}
                                    rightLabel="Quintales"
                                    rightValue={((resumenPeriodo?.totalCantidad ?? 0) / 100).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                />

                                {/* CARD 3: Monto Inversión */}
                                <MetricCardSplit
                                    title="Monto Inversión"
                                    icon="payments"
                                    theme="purple"
                                    leftLabel="Libras"
                                    leftValue={formatCurrency(resumenPeriodo?.totalInversion ?? 0)}
                                    rightLabel="Quintal"
                                    rightValue={formatCurrency(resumenPeriodo?.totalCantidad > 0 ? (resumenPeriodo.totalInversion / (resumenPeriodo.totalCantidad / 100)) : 0)}
                                />

                                {/* CARD 4: Cacao Seco Aproximado */}
                                <MetricCardSplit
                                    title="Cacao Seco Aproximado"
                                    icon="wb_sunny"
                                    theme="amber"
                                    leftLabel="Quintales"
                                    leftValue={(((resumenPeriodo?.totalCantidad ?? 0) / 100) / 2.8).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    rightLabel="Monto"
                                    rightValue={formatCurrency((((resumenPeriodo?.totalCantidad ?? 0) / 100) / 2.8) > 0 ? (resumenPeriodo?.totalInversion ?? 0) / (((resumenPeriodo?.totalCantidad ?? 0) / 100) / 2.8) : 0)}
                                />
                            </div>

                            {/* Centered CTA Button to view detail below metrics cards */}
                            <div className="flex items-center justify-center pt-4">
                                <button
                                    onClick={() => setShowDetailView(true)}
                                    className="inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-primary/30 rounded-xl transition-all duration-200 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                    Ver Detalle Completo de Compras
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    if (showDetailView) {
        if (onBack) return renderDetailView();
        return (
            <ModuleLayout moduleName="Módulo de Bodega" moduleIcon="warehouse">
                {renderDetailView()}
            </ModuleLayout>
        );
    }

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
