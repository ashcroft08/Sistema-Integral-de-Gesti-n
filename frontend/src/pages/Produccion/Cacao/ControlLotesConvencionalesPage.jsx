import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Breadcrumbs from './components/Breadcrumbs';
import ModuleLayout from '../../../components/Layout/ModuleLayout';
import ControlLotesCvTable from './components/ControlLotesCvTable';
import ComercializacionCvTable from './components/ComercializacionCvTable';
import ComercializacionCvModal from './components/ComercializacionCvModal';
import { controlLoteCvService } from '../../../services/controlLoteCv.service';
import { compraGeneralService } from '../../../services/compraGeneral.service';

const ControlLotesConvencionalesPage = ({ onBack }) => {
    const navigate = useNavigate();

    // Periods selection states
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);

    // Main page state
    const [lotes, setLotes] = useState([]);
    const [loadingLotes, setLoadingLotes] = useState(false);
    const [activeTab, setActiveTab] = useState('control'); // 'control' | 'comercializacion'

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState(null);
    const [selectedComercializacion, setSelectedComercializacion] = useState(null);

    // Fetch periods on mount
    useEffect(() => {
        const fetchPeriodos = async () => {
            try {
                setLoadingPeriodos(true);
                const response = await compraGeneralService.getPeriodos();
                const list = response.data || [];
                setPeriodos(list);
                
                if (list.length > 0) {
                    setSelectedPeriod(list[0].id_periodo_compra);
                }
            } catch (err) {
                toast.error('Error al cargar trimestres');
            } finally {
                setLoadingPeriodos(false);
            }
        };
        fetchPeriodos();
    }, []);

    // Fetch control lotes when period changes
    const fetchLotes = useCallback(async () => {
        if (!selectedPeriod) return;
        try {
            setLoadingLotes(true);
            const response = await controlLoteCvService.getAll(selectedPeriod);
            setLotes(response.data || []);
        } catch (err) {
            toast.error('Error al cargar la información de los lotes convencionales');
        } finally {
            setLoadingLotes(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        fetchLotes();
    }, [fetchLotes]);

    // Handle ODP individual update
    const handleUpdateOdp = async (id, odp) => {
        try {
            await controlLoteCvService.update(id, { odp });
            toast.success('ODP convencional actualizada correctamente', { toastId: 'odp-update-cv' });
            fetchLotes();
        } catch (err) {
            toast.error('Error al actualizar ODP convencional', { toastId: 'odp-update-error-cv' });
        }
    };

    // Handle ODP bulk update
    const handleBulkUpdateOdp = async (updates) => {
        try {
            await controlLoteCvService.bulkUpdateOdp(updates);
            toast.success('Secuencia de ODPs autocompletada y guardada correctamente', { toastId: 'odp-update-cv' });
            fetchLotes();
        } catch (err) {
            toast.error('Error al actualizar secuencia de ODPs convencionales', { toastId: 'odp-bulk-error-cv' });
        }
    };

    // Handle toggling of es_seco state
    const handleToggleSeco = async (lote) => {
        const nextSecoState = !lote.es_seco;
        try {
            await controlLoteCvService.update(lote.id_control_lote_cv, { es_seco: nextSecoState });
            toast.success(`Estado del lote cambiado a ${nextSecoState ? 'Seco' : 'Hümedo'}`, { toastId: 'seco-toggle-cv' });
            fetchLotes();
        } catch (err) {
            toast.error('Error al cambiar el estado de humedad del lote', { toastId: 'seco-toggle-error-cv' });
        }
    };

    // Open modal to register commercialization
    const handleOpenRegisterModal = (lote, com) => {
        setSelectedLote(lote);
        setSelectedComercializacion(com);
        setIsModalOpen(true);
    };

    // Save classification commercialization
    const handleSaveComercializacion = async (data) => {
        try {
            await controlLoteCvService.saveComercializacion(data);
            toast.success('Clasificación comercial convencional guardada con éxito', { toastId: 'comercializacion-save-cv' });
            if (data.porcentaje_perdida > 3) {
                toast.warning(`Advertencia: El porcentaje de pérdida (${data.porcentaje_perdida}) supera el límite de 3. Por favor, revise el lote físico.`, { 
                    toastId: `comercializacion-warn-cv-${data.id_control_lote_cv}`,
                    autoClose: 10000 
                });
            }
            fetchLotes();
        } catch (err) {
            throw err;
        }
    };

    // Formatters
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const normalizedDate = new Date(d.getTime() + userTimezoneOffset);
        return normalizedDate.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatDecimal = (val, dec = 2) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '0.00';
        return num.toLocaleString('es-EC', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0.00';
        return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    };

    // Metrics calculations
    const totalLbsOriginal = lotes.reduce((acc, curr) => acc + (parseFloat(curr.cantidad_libra) || 0), 0);
    const countSeco = lotes.filter(l => l.es_seco).length;
    const totalComercializacion = lotes.reduce((acc, curr) => {
        const com = curr.LoteComercializacionCvs?.[0];
        return acc + (com ? parseFloat(com.total) : 0);
    }, 0);

    const activePeriodObj = periodos.find(p => p.id_periodo_compra === parseInt(selectedPeriod, 10));

    const renderContent = () => (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumbs onBack={onBack ? onBack : () => navigate('/produccion')} currentPath="Control Lotes Convencionales" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary dark:text-background-light tracking-tight flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 dark:border-primary/25 text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer group shadow-sm"
                                title="Volver a Producción"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform font-bold">arrow_back</span>
                            </button>
                        )}
                        <span className="material-symbols-outlined text-3xl text-primary font-bold">layers</span>
                        Control de Lotes Convencionales
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-background-light/50 mt-1">
                        Monitorea y clasifica lotes convencionales procesados, gestiona ODPs y registra su distribución de comercialización.
                    </p>
                </div>
            </div>

            {/* Period selector */}
            <div className="rounded-2xl border border-primary/15 bg-white/60 dark:bg-background-dark/45 dark:border-primary/25 backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-full sm:max-w-xs">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-2 px-1">
                            Seleccionar Período / Trimestre
                        </label>
                        <select
                            value={selectedPeriod || ''}
                            onChange={(e) => setSelectedPeriod(e.target.value ? parseInt(e.target.value, 10) : '')}
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
                            <p className="text-xs text-text-primary/95 dark:text-background-light/90 flex flex-wrap items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                                <span className="font-bold">Duración:</span>
                                {formatDate(activePeriodObj.fecha_inicio)} al {formatDate(activePeriodObj.fecha_fin)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty State if no period selected */}
            {!selectedPeriod ? (
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-5">
                        <span className="material-symbols-outlined text-5xl text-primary/40 dark:text-primary/50">calendar_month</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-background-light mb-1">
                        Selecciona un período
                    </h3>
                    <p className="text-sm text-text-secondary/70 dark:text-background-light/40 max-w-md mx-auto">
                        Selecciona un período de compra arriba para visualizar y administrar la trazabilidad de los lotes convencionales.
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-primary/10 dark:border-primary/20 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-4 shadow-sm hover:scale-[1.01] transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">dataset</span>
                            </div>
                            <div>
                                <span className="text-lg font-bold text-text-primary dark:text-background-light block leading-none mb-1">{lotes.length}</span>
                                <span className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 uppercase tracking-wider">Total Lotes</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/10 dark:border-primary/20 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-4 shadow-sm hover:scale-[1.01] transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">scale</span>
                            </div>
                            <div>
                                <span className="text-lg font-bold text-text-primary dark:text-background-light block leading-none mb-1">{formatDecimal(totalLbsOriginal)} Lbs</span>
                                <span className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 uppercase tracking-wider">Peso Total Recibido</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/10 dark:border-primary/20 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-4 shadow-sm hover:scale-[1.01] transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">wb_sunny</span>
                            </div>
                            <div>
                                <span className="text-lg font-bold text-text-primary dark:text-background-light block leading-none mb-1">{countSeco} Lotes</span>
                                <span className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 uppercase tracking-wider">Lotes Secos / Aptos</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/10 dark:border-primary/20 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm p-4 shadow-sm hover:scale-[1.01] transition-all flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">receipt_long</span>
                            </div>
                            <div>
                                <span className="text-lg font-bold text-text-primary dark:text-background-light block leading-none mb-1">{formatDecimal(totalComercializacion)} Lbs</span>
                                <span className="text-[10px] font-bold text-text-secondary dark:text-background-light/50 uppercase tracking-wider">Total Comercializado</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-primary/10 dark:border-primary/20">
                        <button
                            onClick={() => setActiveTab('control')}
                            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'control'
                                    ? 'border-primary text-primary bg-primary/[0.02] dark:bg-primary/[0.04]'
                                    : 'border-transparent text-text-secondary hover:text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                            Control de Lotes
                        </button>
                        <button
                            onClick={() => setActiveTab('comercializacion')}
                            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'comercializacion'
                                    ? 'border-primary text-primary bg-primary/[0.02] dark:bg-primary/[0.04]'
                                    : 'border-transparent text-text-secondary hover:text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">sell</span>
                            Lotes de Comercialización
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white/70 dark:bg-background-dark/40 border border-primary/10 dark:border-primary/20 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                        {activeTab === 'control' ? (
                            <ControlLotesCvTable
                                lotes={lotes}
                                loading={loadingLotes}
                                formatDate={formatDate}
                                formatDecimal={formatDecimal}
                                formatCurrency={formatCurrency}
                                onToggleSeco={handleToggleSeco}
                                onUpdateOdp={handleUpdateOdp}
                                onBulkUpdateOdp={handleBulkUpdateOdp}
                            />
                        ) : (
                            <ComercializacionCvTable
                                lotes={lotes}
                                loading={loadingLotes}
                                formatDate={formatDate}
                                formatDecimal={formatDecimal}
                                onOpenRegisterModal={handleOpenRegisterModal}
                            />
                        )}
                    </div>
                </>
            )}

            {/* Modal for commercialization registration */}
            <ComercializacionCvModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lote={selectedLote}
                comercializacion={selectedComercializacion}
                onSave={handleSaveComercializacion}
            />
        </div>
    );

    if (onBack) {
        return renderContent();
    }

    return (
        <ModuleLayout moduleName="Módulo de Producción" moduleIcon="precision_manufacturing">
            {renderContent()}
        </ModuleLayout>
    );
};

export default ControlLotesConvencionalesPage;
