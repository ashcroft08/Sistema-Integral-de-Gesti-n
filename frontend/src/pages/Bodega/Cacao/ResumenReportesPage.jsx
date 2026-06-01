import React, { useState, useEffect } from 'react';
import { useComprasGenerales } from '../../../hooks/useComprasGenerales';
import Breadcrumbs from './components/Breadcrumbs';

const ResumenReportesPage = ({ onBack }) => {
    const {
        periodos,
        selectedPeriod,
        setSelectedPeriod,
        loadingPeriodos,
        fetchPeriodos,
        reporteResumen,
        loadingReporte,
        fetchReporteResumen
    } = useComprasGenerales();

    // Load periods on mount
    useEffect(() => {
        fetchPeriodos();
    }, [fetchPeriodos]);

    // Load report when selected period changes
    useEffect(() => {
        if (selectedPeriod) {
            fetchReporteResumen(selectedPeriod);
        }
    }, [selectedPeriod, fetchReporteResumen]);

    const activePeriodObj = periodos.find(p => p.id_periodo_compra === parseInt(selectedPeriod, 10));

    // Formatter helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        // Fix timezone offset for DateOnly
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        const normalizedDate = new Date(d.getTime() + userTimezoneOffset);
        return normalizedDate.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatQQ = (val) => {
        if (val === undefined || val === null) return '0,00';
        return parseFloat(val).toLocaleString('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatMoney = (val) => {
        if (val === undefined || val === null) return '$ 0,00';
        return '$ ' + parseFloat(val).toLocaleString('es-EC', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <div className="w-full animation-fade-in space-y-6">
            {/* ═══════ BREADCRUMB ═══════ */}
            <Breadcrumbs onBack={onBack} currentPath="Resumen Reportes" />

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
                        <span className="material-symbols-outlined text-3xl text-primary font-bold">table_view</span>
                        Justificación del Monto Solicitado
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-background-light/50 mt-1">
                        Visualiza y analiza el reporte consolidado de cacao escurrido (Orgánico vs Convencional) acumulado de forma segura en el registro histórico permanente.
                    </p>
                </div>
            </div>

            {/* ═══════ PERIOD SELECTOR (GLASSMORPHIC) ═══════ */}
            <div className="rounded-2xl border border-primary/15 bg-white/60 dark:bg-background-dark/45 dark:border-primary/25 backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm mb-6">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-full sm:max-w-xs">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-2 px-1">
                            Seleccionar Trimestre de Consulta
                        </label>
                        <select
                            value={selectedPeriod || ''}
                            onChange={(e) => setSelectedPeriod(e.target.value || null)}
                            disabled={loadingPeriodos || loadingReporte}
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
                        <div className="flex-1 self-end sm:self-center mt-2 sm:mt-5 p-2.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 animate-in fade-in duration-200">
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
                                    {activePeriodObj.estado === 'APROBADO' ? 'Aprobado y Cerrado' : 'Borrador'}
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
            </div>

            {/* ═══════ CONTENT STATES ═══════ */}
            {loadingReporte ? (
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-20 text-center shadow-sm">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-4 animate-spin text-primary">
                        <span className="material-symbols-outlined text-4xl">sync</span>
                    </div>
                    <p className="text-sm font-bold text-text-secondary dark:text-background-light/60">
                        Generando reporte consolidado...
                    </p>
                </div>
            ) : !selectedPeriod ? (
                /* EMPTY STATE: NO PERIOD SELECTED */
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/5 dark:bg-primary/10 mx-auto mb-5">
                        <span className="material-symbols-outlined text-5xl text-primary/50 dark:text-primary/60">table_chart</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-background-light mb-1">
                        Consulta del Historial Permanente
                    </h3>
                    <p className="text-sm text-text-secondary/70 dark:text-background-light/40 max-w-md mx-auto">
                        Selecciona un período de la lista desplegable superior para cargar el reporte oficial consolidado de justificación de montos.
                    </p>
                </div>
            ) : activePeriodObj && activePeriodObj.estado !== 'APROBADO' ? (
                /* ALERTA: TRIMESTRE NO APROBADO (STAGING / BORRADOR) */
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.08] p-8 text-center shadow-sm animate-in fade-in duration-300 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl font-bold">warning</span>
                    </div>
                    <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-2">
                        Trimestre Pendiente de Aprobación
                    </h3>
                    <p className="text-sm text-amber-700/90 dark:text-amber-500/80 leading-relaxed max-w-md mx-auto">
                        Este período se encuentra actualmente en <strong>Borrador de Revisión</strong>. Para poder generar este reporte oficial agrupado, primero debes aprobar el período en la pantalla de <strong>"Compras Generales"</strong> haciendo clic en <em>"Aprobar y Guardar de forma Permanente"</em>. Esto consolidará los datos de compras en el Historial Permanente del sistema.
                    </p>
                </div>
            ) : reporteResumen && reporteResumen.reporte && reporteResumen.reporte.length === 0 ? (
                /* ALERTA: SIN REGISTROS */
                <div className="rounded-2xl border border-primary/10 dark:border-primary/20 bg-white/40 dark:bg-background-dark/30 py-16 px-6 text-center shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/5 dark:bg-red-500/10 mx-auto mb-4 text-red-500">
                        <span className="material-symbols-outlined text-4xl">inventory</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary/60 dark:text-background-light/40 mb-1">
                        Trimestre sin Compras Registradas
                    </h3>
                    <p className="text-sm text-text-secondary/60 dark:text-background-light/30 max-w-md mx-auto">
                        No se encontraron registros consolidados en el historial de este trimestre.
                    </p>
                </div>
            ) : (
                /* REPORT CONTENT LOADED */
                <div className="rounded-2xl border border-primary/15 dark:border-primary/25 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                    {/* Tabla Título de Encabezado */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 dark:border-primary/20">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-xl">table_chart</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary dark:text-background-light">
                                    Justificación del Monto Solicitado
                                </h3>
                                <p className="text-xs text-text-secondary dark:text-background-light/40">
                                    Resumen mensual consolidado de Cacao Orgánico y Convencional ({activePeriodObj?.nombre})
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                            <thead>
                                {/* Header Row 1 */}
                                <tr className="bg-primary/[0.04] dark:bg-primary/[0.08] border-b border-primary/10 dark:border-primary/20 text-center font-bold text-text-primary dark:text-background-light uppercase tracking-wider text-xs">
                                    <th rowSpan={2} className="px-6 py-4 text-left border-r border-primary/10 dark:border-primary/20 min-w-[150px] font-bold text-text-primary dark:text-background-light">
                                        MES
                                    </th>
                                    <th colSpan={2} className="px-6 py-3 border-r border-primary/10 dark:border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04] font-bold text-text-primary dark:text-background-light">
                                        Cacao Orgánico Escurrido
                                    </th>
                                    <th colSpan={2} className="px-6 py-3 border-r border-primary/10 dark:border-primary/20 bg-amber-500/[0.02] dark:bg-amber-500/[0.04] font-bold text-text-primary dark:text-background-light">
                                        Cacao Convencional Escurrido
                                    </th>
                                    <th colSpan={2} className="px-6 py-3 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] font-bold text-text-primary dark:text-background-light">
                                        Total Escurrido Org/Conven
                                    </th>
                                </tr>
                                {/* Header Row 2 */}
                                <tr className="bg-primary/[0.02] dark:bg-primary/[0.04] border-b border-primary/10 dark:border-primary/20 text-center font-bold text-text-secondary dark:text-background-light/70 text-xs">
                                    <th className="px-4 py-2.5 border-r border-primary/10 dark:border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04]">
                                        QQ
                                    </th>
                                    <th className="px-4 py-2.5 border-r border-primary/10 dark:border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04]">
                                        Monto ($)
                                    </th>
                                    <th className="px-4 py-2.5 border-r border-primary/10 dark:border-primary/20 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]">
                                        QQ
                                    </th>
                                    <th className="px-4 py-2.5 border-r border-primary/10 dark:border-primary/20 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]">
                                        Monto ($)
                                    </th>
                                    <th className="px-4 py-2.5 border-r border-primary/10 dark:border-primary/20 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]">
                                        QQ
                                    </th>
                                    <th className="px-4 py-2.5 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]">
                                        Monto ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteResumen && reporteResumen.reporte && reporteResumen.reporte.map((row, index) => (
                                    <tr 
                                        key={index} 
                                        className={`transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] border-b border-primary/[0.06] dark:border-primary/[0.12] ${
                                            index % 2 === 0
                                                ? 'bg-transparent'
                                                : 'bg-primary/[0.015] dark:bg-primary/[0.04]'
                                        }`}
                                    >
                                        <td className="px-6 py-4 font-bold text-text-primary dark:text-background-light border-r border-primary/10 dark:border-primary/20">
                                            {row.mes}
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-primary/[0.06] dark:border-primary/[0.12] text-text-primary dark:text-background-light font-medium">
                                            {formatQQ(row.organico.qq)}
                                        </td>
                                        <td className="px-6 py-4 text-right border-r border-primary/10 dark:border-primary/20 font-medium text-emerald-700 dark:text-emerald-400 bg-primary/[0.01] dark:bg-primary/[0.02] font-mono text-xs">
                                            {formatMoney(row.organico.monto)}
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-primary/[0.06] dark:border-primary/[0.12] text-text-primary dark:text-background-light font-medium">
                                            {formatQQ(row.convencional.qq)}
                                        </td>
                                        <td className="px-6 py-4 text-right border-r border-primary/10 dark:border-primary/20 font-medium text-emerald-700 dark:text-emerald-400 bg-amber-500/[0.01] dark:bg-amber-500/[0.02] font-mono text-xs">
                                            {formatMoney(row.convencional.monto)}
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-primary/[0.06] dark:border-primary/[0.12] font-bold text-primary dark:text-accent">
                                            {formatQQ(row.total.qq)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02] font-mono text-xs">
                                            {formatMoney(row.total.monto)}
                                        </td>
                                    </tr>
                                ))}

                                {/* ═══════ TOTALS ROW (EXACT BOCETO STYLE) ═══════ */}
                                {reporteResumen && reporteResumen.totalesGenerales && (
                                    <tr className="bg-primary/5 dark:bg-gray-900/50 border-t-2 border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light font-bold">
                                        <td className="px-6 py-5 border-r border-primary/10 dark:border-primary/20 tracking-wide uppercase text-sm">
                                            TOTAL
                                        </td>
                                        <td className="px-6 py-5 text-center border-r border-primary/[0.06] dark:border-primary/[0.12] decoration-2 underline underline-offset-4">
                                            {formatQQ(reporteResumen.totalesGenerales.organico.qq)}
                                        </td>
                                        <td className="px-6 py-5 text-right border-r border-primary/10 dark:border-primary/20 decoration-2 underline underline-offset-4 bg-primary/[0.02] dark:bg-primary/[0.04] font-mono text-sm text-emerald-700 dark:text-emerald-400">
                                            {formatMoney(reporteResumen.totalesGenerales.organico.monto)}
                                        </td>
                                        <td className="px-6 py-5 text-center border-r border-primary/[0.06] dark:border-primary/[0.12] decoration-2 underline underline-offset-4">
                                            {formatQQ(reporteResumen.totalesGenerales.convencional.qq)}
                                        </td>
                                        <td className="px-6 py-5 text-right border-r border-primary/10 dark:border-primary/20 decoration-2 underline underline-offset-4 bg-amber-500/[0.01] dark:bg-amber-500/[0.02] font-mono text-sm text-emerald-700 dark:text-emerald-400">
                                            {formatMoney(reporteResumen.totalesGenerales.convencional.monto)}
                                        </td>
                                        <td className="px-6 py-5 text-center border-r border-primary/[0.06] dark:border-primary/[0.12] decoration-2 underline underline-offset-4 text-primary dark:text-accent">
                                            {formatQQ(reporteResumen.totalesGenerales.total.qq)}
                                        </td>
                                        <td className="px-6 py-5 text-right decoration-2 underline underline-offset-4 text-emerald-700 dark:text-emerald-400 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02] font-mono text-sm">
                                            {formatMoney(reporteResumen.totalesGenerales.total.monto)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumenReportesPage;
