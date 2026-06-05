import React, { useState, useEffect, useCallback } from 'react';
import { useComprasGenerales } from '../../../hooks/useComprasGenerales';
import { compraExternaService } from '../../../services/compraExterna.service';
import { proveedorService } from '../../../services/proveedor.service';
import Breadcrumbs from './components/Breadcrumbs';
import { toast } from 'react-toastify';

// Modular Child Components
import ProveedorModal from './components/ProveedorModal';
import CompraExternaModal from './components/CompraExternaModal';
import ComprasExternasTable from './components/ComprasExternasTable';

const ComprasExternasPage = ({ onBack }) => {
    const {
        periodos,
        selectedPeriod,
        setSelectedPeriod,
        loadingPeriodos,
        fetchPeriodos,
    } = useComprasGenerales();

    const [compras, setCompras] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loadingCompras, setLoadingCompras] = useState(false);
    const [proveedores, setProveedores] = useState([]);

    // Modals and Tab state
    const [activeTab, setActiveTab] = useState('financiero');
    const [showModal, setShowModal] = useState(false);
    const [showNewProveedorModal, setShowNewProveedorModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    // Pass initial values to the purchase modal
    const [modalInitialValues, setModalInitialValues] = useState(null);

    // Load periods and providers
    useEffect(() => {
        fetchPeriodos();
    }, [fetchPeriodos]);

    const fetchProveedores = useCallback(async () => {
        try {
            const res = await proveedorService.getAll();
            if (res.success) {
                setProveedores(res.data || []);
            }
        } catch (err) {
            console.error('Error al cargar proveedores:', err);
        }
    }, []);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    const activePeriodObj = periodos.find(p => p.id_periodo_compra === parseInt(selectedPeriod, 10));

    // Fetch purchases
    const fetchCompras = useCallback(async (periodId) => {
        if (!periodId) {
            setCompras([]);
            setResumen(null);
            return;
        }
        try {
            setLoadingCompras(true);
            const res = await compraExternaService.getAll(periodId);
            if (res.success) {
                setCompras(res.compras || []);
                setResumen(res.resumen || null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error al cargar compras externas');
        } finally {
            setLoadingCompras(false);
        }
    }, []);

    useEffect(() => {
        fetchCompras(selectedPeriod);
    }, [selectedPeriod, fetchCompras]);

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
        if (isNaN(num)) return '0,00';
        return num.toLocaleString('es-EC', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    };

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '$0,00';
        return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    };

    // Table Column Totals
    const totalPesoProv = compras.reduce((acc, c) => acc + (parseFloat(c.peso_proveedor) || 0), 0);
    const totalPesoDif = compras.reduce((acc, c) => acc + (parseFloat(c.peso_diferencia) || 0), 0);
    const totalQqFacturas = compras.reduce((acc, c) => acc + (parseFloat(c.quintales_facturas) || 0), 0);
    const totalMontoPagar = compras.reduce((acc, c) => acc + (parseFloat(c.total) || 0), 0);
    const totalLbsSeco = compras.reduce((acc, c) => acc + (parseFloat(c.libras_seco) || 0), 0);
    const totalEscLbs = compras.reduce((acc, c) => acc + (parseFloat(c.libras_escurrido) || 0), 0);
    const totalEscQq = compras.reduce((acc, c) => acc + (parseFloat(c.quintales_escurrido) || 0), 0);

    const totalPesoAss = compras.reduce((acc, c) => acc + (parseFloat(c.peso_ass) || 0), 0);
    const totalPesoAs = compras.reduce((acc, c) => acc + (parseFloat(c.peso_as) || 0), 0);
    const totalPesoPajarito = compras.reduce((acc, c) => acc + (parseFloat(c.peso_pajarito) || 0), 0);
    const totalPesoBasura = compras.reduce((acc, c) => acc + (parseFloat(c.peso_basura) || 0), 0);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentId(null);
        setModalInitialValues(null);
        setShowModal(true);
    };

    const handleOpenEdit = (compra) => {
        setIsEditing(true);
        setCurrentId(compra.id_compra_externa);
        
        const d = new Date(compra.fecha);
        const dateString = !isNaN(d.getTime()) 
            ? new Date(d.getTime() + d.getTimezoneOffset() * 60000).toISOString().split('T')[0] 
            : '';

        setModalInitialValues({
            fecha: dateString,
            idProveedor: compra.id_proveedor || '',
            esOrganico: !!compra.es_organico,
            pesoProveedor: compra.peso_proveedor || '',
            quintalesFacturas: compra.quintales_facturas || '',
            costoUnitario: compra.costo_unitario || '',
            pesoAss: compra.peso_ass || '',
            pesoAs: compra.peso_as || '',
            pesoPajarito: compra.peso_pajarito || '',
            pesoBasura: compra.peso_basura || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (formData) => {
        if (!selectedPeriod) return;

        if (!formData.idProveedor) {
            toast.error('Debe seleccionar un proveedor para registrar la compra.');
            return;
        }

        // Validation: sum of 4 fields must equal qqFact
        if (Math.abs(formData.totalQqCalc - formData.quintalesFacturas) > 0.009) {
            const diferencia = Math.abs(formData.totalQqCalc - formData.quintalesFacturas);
            toast.error(
                `La suma del detalle físico (${formatDecimal(formData.totalQqCalc)} QQ) no coincide con las QQ Facturadas (${formatDecimal(formData.quintalesFacturas)} QQ). Existe una diferencia de ${formatDecimal(diferencia)} QQ.`
            );
            return;
        }

        const data = {
            id_periodo_compra: parseInt(selectedPeriod, 10),
            fecha: formData.fecha,
            id_proveedor: parseInt(formData.idProveedor, 10),
            es_organico: formData.esOrganico,
            peso_proveedor: formData.pesoProveedor,
            peso_diferencia: formData.pesoDiferencia,
            quintales_facturas: formData.quintalesFacturas,
            costo_unitario: formData.costoUnitario,
            total: formData.total,
            peso_ass: formData.pesoAss,
            peso_as: formData.pesoAs,
            peso_pajarito: formData.pesoPajarito,
            peso_basura: formData.pesoBasura,
            libras_seco: formData.librasSeco,
            libras_escurrido: formData.librasEscurrido,
            quintales_escurrido: formData.quintalesEscurrido
        };

        try {
            let res;
            if (isEditing) {
                res = await compraExternaService.update(currentId, data);
            } else {
                res = await compraExternaService.create(data);
            }

            if (res.success) {
                toast.success(res.message);
                setShowModal(false);
                fetchCompras(selectedPeriod);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error al guardar la compra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) return;
        try {
            const res = await compraExternaService.delete(id);
            if (res.success) {
                toast.success(res.message);
                fetchCompras(selectedPeriod);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error al eliminar');
        }
    };

    const handleNewProveedorSuccess = (newProvider) => {
        setProveedores((prev) => [...prev, newProvider].sort((a, b) => a.nombres.localeCompare(b.nombres)));
        
        // Auto-select in the purchase modal
        setModalInitialValues((prev) => ({
            ...prev,
            idProveedor: newProvider.id_proveedor.toString()
        }));
        setShowNewProveedorModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* ═══════ BREADCRUMB ═══════ */}
            <Breadcrumbs onBack={onBack} currentPath="Compras Externas" />

            {/* ═══════ HEADER ═══════ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary dark:text-background-light tracking-tight flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 dark:border-primary/25 text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer group shadow-sm"
                                title="Volver"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:-translate-x-0.5 transition-transform font-bold">arrow_back</span>
                            </button>
                        )}
                        <span className="material-symbols-outlined text-3xl text-primary font-bold">shopping_bag</span>
                        Compras Externas Cacao
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-background-light/50 mt-1">
                        Registra y gestiona de manera física y financiera las compras externas de cacao por periodos.
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
                                }}`}>
                                    <span className="material-symbols-outlined text-[10px] font-bold">
                                        {activePeriodObj.estado === 'APROBADO' ? 'lock' : 'lock_open'}
                                    </span>
                                    {activePeriodObj.estado}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                {selectedPeriod && activePeriodObj && (
                    <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-5">
                        <button
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Agregar Compra
                        </button>
                    </div>
                )}
            </div>

            {/* ═══════ NO PERIOD SELECTED (EMPTY STATE) ═══════ */}
            {!selectedPeriod && (
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-5">
                        <span className="material-symbols-outlined text-5xl text-primary/40 dark:text-primary/50">calendar_month</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-background-light mb-1">
                        Selecciona un Trimestre
                    </h3>
                    <p className="text-sm text-text-secondary/70 dark:text-background-light/40 max-w-md mx-auto">
                        Para poder gestionar tus compras externas de cacao, primero debes seleccionar un trimestre o período de consulta.
                    </p>
                </div>
            )}

            {/* ═══════ REPORT CONTENT LOADED ═══════ */}
            {selectedPeriod && (
                <>
                    {/* Aggregates Cards */}
                    {resumen && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in-50 duration-200">
                            <div className="p-4 rounded-2xl border border-primary/10 bg-white/50 dark:bg-background-dark/40 shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary dark:text-background-light/50">Total Peso Proveedor</span>
                                <p className="text-xl font-bold text-text-primary dark:text-background-light mt-1">{formatDecimal(resumen.totalPesoProveedor)} QQ</p>
                            </div>
                            <div className="p-4 rounded-2xl border border-primary/10 bg-white/50 dark:bg-background-dark/40 shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary dark:text-background-light/50">Total Facturadas</span>
                                <p className="text-xl font-bold text-text-primary dark:text-background-light mt-1">{formatDecimal(resumen.totalQuintalesFacturas)} QQ</p>
                            </div>
                            <div className="p-4 rounded-2xl border border-primary/10 bg-white/50 dark:bg-background-dark/40 shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary dark:text-background-light/50">Total Inversión</span>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(resumen.totalMonto)}</p>
                            </div>
                            <div className="p-4 rounded-2xl border border-primary/10 bg-white/50 dark:bg-background-dark/40 shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary dark:text-background-light/50">Total Escurrido</span>
                                <p className="text-xl font-bold text-text-primary dark:text-background-light mt-1">{formatDecimal(totalEscQq, 3)} QQ</p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-primary/15 dark:border-primary/25 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm overflow-hidden shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-primary/10 dark:border-primary/20 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-xl">list</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-text-primary dark:text-background-light flex items-center gap-2">
                                        Listado de Compras Externas
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                                            {compras.length}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-text-secondary dark:text-background-light/40">
                                        Registros detallados de compras de cacao por periodos
                                    </p>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex items-center gap-1 p-1 bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10 dark:border-primary/20 rounded-xl self-end md:self-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('financiero')}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        activeTab === 'financiero'
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-text-primary/75 dark:text-background-light/70 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">payments</span>
                                    Financiero
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('fisico')}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        activeTab === 'fisico'
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-text-primary/75 dark:text-background-light/70 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">scale</span>
                                    Detalle Físico
                                </button>
                            </div>
                        </div>

                        {/* Modular Table Component */}
                        <ComprasExternasTable
                            compras={compras}
                            loading={loadingCompras}
                            activeTab={activeTab}
                            formatDate={formatDate}
                            formatDecimal={formatDecimal}
                            formatCurrency={formatCurrency}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                            totals={{
                                totalPesoProv,
                                totalPesoDif,
                                totalQqFacturas,
                                totalMontoPagar,
                                totalPesoAss,
                                totalPesoAs,
                                totalPesoPajarito,
                                totalPesoBasura,
                                totalLbsSeco,
                                totalEscLbs,
                                totalEscQq
                            }}
                        />
                    </div>
                </>
            )}

            {/* Modular Compra Externa Modal */}
            <CompraExternaModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                isEditing={isEditing}
                proveedores={proveedores}
                onOpenNewProveedor={() => setShowNewProveedorModal(true)}
                initialValues={modalInitialValues}
                onSubmit={handleSubmit}
                formatDecimal={formatDecimal}
                formatCurrency={formatCurrency}
            />

            {/* Modular Proveedor Modal */}
            <ProveedorModal
                isOpen={showNewProveedorModal}
                onClose={() => setShowNewProveedorModal(false)}
                onSuccess={handleNewProveedorSuccess}
                proveedores={proveedores}
            />
        </div>
    );
};

export default ComprasExternasPage;
