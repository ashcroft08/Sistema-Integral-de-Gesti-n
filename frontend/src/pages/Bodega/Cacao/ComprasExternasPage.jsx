import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useComprasGenerales } from '../../../hooks/useComprasGenerales';
import { compraExternaService } from '../../../services/compraExterna.service';
import Breadcrumbs from './components/Breadcrumbs';
import { toast } from 'react-toastify';

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

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form fields
    const [fecha, setFecha] = useState('');
    const [nombres, setNombres] = useState('');
    const [esOrganico, setEsOrganico] = useState(false);
    const [pesoProveedor, setPesoProveedor] = useState('');
    const [quintalesFacturas, setQuintalesFacturas] = useState('');
    const [costoUnitario, setCostoUnitario] = useState('');
    const [pesoAss, setPesoAss] = useState('');
    const [pesoAs, setPesoAs] = useState('');
    const [pesoPajarito, setPesoPajarito] = useState('');
    const [pesoBasura, setPesoBasura] = useState('');

    // Load periods
    useEffect(() => {
        fetchPeriodos();
    }, [fetchPeriodos]);

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

    // Form calculations (automated on render)
    const pProv = parseFloat(pesoProveedor) || 0;
    const qqFact = parseFloat(quintalesFacturas) || 0;
    const pDif = Math.abs(pProv - qqFact);
    const cUnit = parseFloat(costoUnitario) || 0;
    const totalCalc = qqFact * cUnit;
    const pAss = parseFloat(pesoAss) || 0;
    const pAs = parseFloat(pesoAs) || 0;
    const pPajarito = parseFloat(pesoPajarito) || 0;
    const pBasura = parseFloat(pesoBasura) || 0;
    
    // Physical fields sum validation check
    const totalQqCalc = pAss + pAs + pPajarito + pBasura;
    
    // Automated formulas
    const libSeco = qqFact * 100;
    const libEsc = libSeco * 2.6;
    const qqEsc = libEsc / 100;

    // Table Column Totals
    const totalPesoProv = compras.reduce((acc, c) => acc + (parseFloat(c.peso_proveedor) || 0), 0);
    const totalPesoDif = compras.reduce((acc, c) => acc + (parseFloat(c.peso_diferencia) || 0), 0);
    const totalQqFacturas = compras.reduce((acc, c) => acc + (parseFloat(c.quintales_facturas) || 0), 0);
    const totalMontoPagar = compras.reduce((acc, c) => acc + (parseFloat(c.total) || 0), 0);
    const totalFisicoQq = compras.reduce((acc, c) => acc + (parseFloat(c.total_qq) || 0), 0);
    const totalLbsSeco = compras.reduce((acc, c) => acc + (parseFloat(c.libras_seco) || 0), 0);
    const totalEscLbs = compras.reduce((acc, c) => acc + (parseFloat(c.libras_escurrido) || 0), 0);
    const totalEscQq = compras.reduce((acc, c) => acc + (parseFloat(c.quintales_escurrido) || 0), 0);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFecha('');
        setNombres('');
        setEsOrganico(false);
        setPesoProveedor('');
        setQuintalesFacturas('');
        setCostoUnitario('');
        setPesoAss('');
        setPesoAs('');
        setPesoPajarito('');
        setPesoBasura('');
        setShowModal(true);
    };

    const handleOpenEdit = (compra) => {
        setIsEditing(true);
        setCurrentId(compra.id_compra_externa);
        
        // Format date cleanly for HTML input
        const d = new Date(compra.fecha);
        const dateString = !isNaN(d.getTime()) 
            ? new Date(d.getTime() + d.getTimezoneOffset() * 60000).toISOString().split('T')[0] 
            : '';

        setFecha(dateString);
        setNombres(compra.nombres || '');
        setEsOrganico(!!compra.es_organico);
        setPesoProveedor(compra.peso_proveedor || '');
        setQuintalesFacturas(compra.quintales_facturas || '');
        setCostoUnitario(compra.costo_unitario || '');
        setPesoAss(compra.peso_ass || '');
        setPesoAs(compra.peso_as || '');
        setPesoPajarito(compra.peso_pajarito || '');
        setPesoBasura(compra.peso_basura || '');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPeriod) return;

        // Validation: sum of 4 fields (pAss + pAs + pPajarito + pBasura) must equal qqFact (QQ Facturadas)
        // Allow a tiny tolerance for floating point representation issues (e.g. 0.009)
        if (Math.abs(totalQqCalc - qqFact) > 0.009) {
            const diferencia = Math.abs(totalQqCalc - qqFact);
            toast.error(
                `La suma del detalle físico (${formatDecimal(totalQqCalc)} QQ) no coincide con las QQ Facturadas (${formatDecimal(qqFact)} QQ). Existe una diferencia de ${formatDecimal(diferencia)} QQ.`
            );
            return;
        }

        const data = {
            id_periodo_compra: parseInt(selectedPeriod, 10),
            fecha,
            nombres,
            es_organico: esOrganico,
            peso_proveedor: pProv,
            peso_diferencia: pDif,
            quintales_facturas: qqFact,
            costo_unitario: cUnit,
            total: totalCalc,
            peso_ass: pAss,
            peso_as: pAs,
            peso_pajarito: pPajarito,
            peso_basura: pBasura,
            total_qq: totalQqCalc,
            libras_seco: libSeco,
            libras_escurrido: libEsc,
            quintales_escurrido: qqEsc
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
                                }`}>
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
                                <p className="text-xl font-bold text-text-primary dark:text-background-light mt-1">{formatDecimal(resumen.totalEscurridoLibras)} Lb</p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-primary/15 dark:border-primary/25 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 dark:border-primary/20">
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
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-primary/[0.04] dark:bg-primary/[0.08] border-b border-primary/10 dark:border-primary/20 text-center font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider text-xs">
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                        <th className="px-4 py-3 text-left">Proveedor</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Peso Prov. (QQ)</th>
                                        <th className="px-4 py-3">Peso Dif. (QQ)</th>
                                        <th className="px-4 py-3">QQ Facturadas</th>
                                        <th className="px-4 py-3">Costo Unit.</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Total Físico (QQ)</th>
                                        <th className="px-4 py-3">Lbs Seco</th>
                                        <th className="px-4 py-3">Escurrido Lbs</th>
                                        <th className="px-4 py-3">Escurrido QQ</th>
                                        <th className="px-4 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingCompras ? (
                                        <tr>
                                            <td colSpan={13} className="text-center py-10">Cargando compras...</td>
                                        </tr>
                                    ) : compras.length === 0 ? (
                                        <tr>
                                            <td colSpan={13} className="text-center py-10 text-text-secondary">No hay compras externas registradas en este período.</td>
                                        </tr>
                                    ) : (
                                        compras.map((c) => (
                                            <tr key={c.id_compra_externa} className="border-b border-primary/[0.06] hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors text-center text-text-primary dark:text-background-light font-medium">
                                                <td className="px-4 py-3 text-left font-bold">{formatDate(c.fecha)}</td>
                                                <td className="px-4 py-3 text-left">
                                                    <div>
                                                        <span className="font-semibold block">{c.nombres}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                        c.es_organico
                                                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                                    }`}>
                                                        {c.es_organico ? 'ORGÁNICO' : 'CONVENCIONAL'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{formatDecimal(c.peso_proveedor)}</td>
                                                <td className="px-4 py-3 text-amber-600">{formatDecimal(c.peso_diferencia)}</td>
                                                <td className="px-4 py-3 font-semibold text-primary">{formatDecimal(c.quintales_facturas)}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{formatCurrency(c.costo_unitario)}</td>
                                                <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(c.total)}</td>
                                                <td className="px-4 py-3">{formatDecimal(c.total_qq)}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{formatDecimal(c.libras_seco)}</td>
                                                <td className="px-4 py-3">{formatDecimal(c.libras_escurrido)}</td>
                                                <td className="px-4 py-3 font-semibold text-primary">{formatDecimal(c.quintales_escurrido, 3)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleOpenEdit(c)}
                                                            className="p-1 hover:bg-primary/10 rounded-lg text-primary transition-colors cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined text-base">edit</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {compras.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-primary/[0.03] dark:bg-primary/[0.06] border-t-2 border-primary/15 font-bold text-center text-text-primary dark:text-background-light">
                                            <td colSpan={3} className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">TOTAL</td>
                                            <td className="px-4 py-3">{formatDecimal(totalPesoProv)}</td>
                                            <td className="px-4 py-3 text-amber-600">{formatDecimal(totalPesoDif)}</td>
                                            <td className="px-4 py-3 font-bold text-primary">{formatDecimal(totalQqFacturas)}</td>
                                            <td className="px-4 py-3 font-mono text-xs">—</td>
                                            <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalMontoPagar)}</td>
                                            <td className="px-4 py-3">{formatDecimal(totalFisicoQq)}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{formatDecimal(totalLbsSeco)}</td>
                                            <td className="px-4 py-3">{formatDecimal(totalEscLbs)}</td>
                                            <td className="px-4 py-3 font-bold text-primary">{formatDecimal(totalEscQq, 3)}</td>
                                            <td className="px-4 py-3">—</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════ CREATE / EDIT MODAL ═══════ */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <form
                        onSubmit={handleSubmit}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                                <span className="material-symbols-outlined text-2xl text-primary">shopping_bag</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                                    {isEditing ? 'Editar Compra Externa' : 'Nueva Compra Externa'}
                                </h3>
                                <p className="text-xs text-text-secondary dark:text-background-light/50">
                                    Ingresa los parámetros físicos y de peso del cacao para el reporte
                                </p>
                            </div>
                        </div>

                        {/* Two Columns Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                            {/* Left Column: Basic Info & Primary Weights */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">badge</span> Datos Generales
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Fecha *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={fecha}
                                            onChange={(e) => setFecha(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={esOrganico}
                                                onChange={(e) => setEsOrganico(e.target.checked)}
                                                className="w-4 h-4 rounded text-primary focus:ring-primary border-primary/20"
                                            />
                                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50">¿Es Orgánico?</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                        Proveedor / Nombres *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nombre del proveedor"
                                        value={nombres}
                                        onChange={(e) => setNombres(e.target.value)}
                                        className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/10 pt-2 pb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">scale</span> Pesajes y Facturación
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Peso Proveedor (QQ) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            value={pesoProveedor}
                                            onChange={(e) => setPesoProveedor(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            QQ Facturadas *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            value={quintalesFacturas}
                                            onChange={(e) => setQuintalesFacturas(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                        Peso Diferencia (QQ)
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        disabled
                                        value={formatDecimal(pDif)}
                                        className="w-full rounded-xl border border-primary/25 dark:border-primary/35 bg-primary/5 text-sm text-text-secondary dark:text-background-light/60 px-3.5 py-2 outline-none cursor-not-allowed font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                        Costo Unitario ($) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        required
                                        placeholder="0.0000"
                                        value={costoUnitario}
                                        onChange={(e) => setCostoUnitario(e.target.value)}
                                        className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Physical Weights & Previews */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/10 pb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">inventory</span> Detalle Físico Cacao
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Peso ASS (QQ)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={pesoAss}
                                            onChange={(e) => setPesoAss(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Peso AS (QQ)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={pesoAs}
                                            onChange={(e) => setPesoAs(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Peso Pajarito (QQ)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={pesoPajarito}
                                            onChange={(e) => setPesoPajarito(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Peso Basura (QQ)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={pesoBasura}
                                            onChange={(e) => setPesoBasura(e.target.value)}
                                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Libras Seco
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            disabled
                                            value={formatDecimal(libSeco)}
                                            className="w-full rounded-xl border border-primary/25 dark:border-primary/35 bg-primary/5 text-sm text-text-secondary dark:text-background-light/60 px-3.5 py-2 outline-none cursor-not-allowed font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Escurrido (Lb)
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            disabled
                                            value={formatDecimal(libEsc)}
                                            className="w-full rounded-xl border border-primary/25 dark:border-primary/35 bg-primary/5 text-sm text-text-secondary dark:text-background-light/60 px-3.5 py-2 outline-none cursor-not-allowed font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                            Escurrido (QQ)
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            disabled
                                            value={formatDecimal(qqEsc, 3)}
                                            className="w-full rounded-xl border border-primary/25 dark:border-primary/35 bg-primary/5 text-sm text-text-secondary dark:text-background-light/60 px-3.5 py-2 outline-none cursor-not-allowed font-semibold"
                                        />
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/10 pt-2 pb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">calculate</span> Resumen de Cálculos
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {(() => {
                                        const isDifferent = Math.abs(totalQqCalc - qqFact) > 0.009;
                                        const colorClass = isDifferent 
                                            ? 'text-amber-600 dark:text-amber-400' 
                                            : 'text-primary dark:text-primary-light';
                                        return (
                                            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 flex flex-col items-center justify-center text-center">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${colorClass}`}>Total Físico</span>
                                                <span className={`text-lg font-black mt-1.5 ${colorClass}`}>
                                                    {formatDecimal(totalQqCalc)} QQ
                                                </span>
                                            </div>
                                        );
                                    })()}
                                    <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total a Pagar</span>
                                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                                            {formatCurrency(totalCalc)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-end border-t border-primary/10 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Guardar Compra'}
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ComprasExternasPage;
