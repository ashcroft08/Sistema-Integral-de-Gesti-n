import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CompraExternaModal = ({
    isOpen,
    onClose,
    isEditing,
    proveedores,
    onOpenNewProveedor,
    initialValues,
    onSubmit,
    formatDecimal,
    formatCurrency
}) => {
    // Form fields
    const [fecha, setFecha] = useState('');
    const [idProveedor, setIdProveedor] = useState('');
    const [esOrganico, setEsOrganico] = useState(false);
    const [pesoProveedor, setPesoProveedor] = useState('');
    const [quintalesFacturas, setQuintalesFacturas] = useState('');
    const [costoUnitario, setCostoUnitario] = useState('');
    const [pesoAss, setPesoAss] = useState('');
    const [pesoAs, setPesoAs] = useState('');
    const [pesoPajarito, setPesoPajarito] = useState('');
    const [pesoBasura, setPesoBasura] = useState('');

    useEffect(() => {
        if (isOpen && initialValues) {
            setFecha(initialValues.fecha || '');
            setIdProveedor(initialValues.idProveedor || '');
            setEsOrganico(!!initialValues.esOrganico);
            setPesoProveedor(initialValues.pesoProveedor || '');
            setQuintalesFacturas(initialValues.quintalesFacturas || '');
            setCostoUnitario(initialValues.costoUnitario || '');
            setPesoAss(initialValues.pesoAss || '');
            setPesoAs(initialValues.pesoAs || '');
            setPesoPajarito(initialValues.pesoPajarito || '');
            setPesoBasura(initialValues.pesoBasura || '');
        } else if (isOpen) {
            setFecha('');
            setIdProveedor('');
            setEsOrganico(false);
            setPesoProveedor('');
            setQuintalesFacturas('');
            setCostoUnitario('');
            setPesoAss('');
            setPesoAs('');
            setPesoPajarito('');
            setPesoBasura('');
        }
    }, [isOpen, initialValues]);

    // Handle auto-selection when a new provider is created externally
    useEffect(() => {
        if (isOpen && initialValues?.idProveedor) {
            setIdProveedor(initialValues.idProveedor);
        }
    }, [isOpen, initialValues?.idProveedor]);

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

    const handleSubmitLocal = (e) => {
        e.preventDefault();
        
        onSubmit({
            fecha,
            idProveedor,
            esOrganico,
            pesoProveedor: pProv,
            pesoDiferencia: pDif,
            quintalesFacturas: qqFact,
            costoUnitario: cUnit,
            total: totalCalc,
            pesoAss: pAss,
            pesoAs: pAs,
            pesoPajarito: pPajarito,
            pesoBasura: pBasura,
            librasSeco: libSeco,
            librasEscurrido: libEsc,
            quintalesEscurrido: qqEsc,
            totalQqCalc
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
            <form
                onSubmit={handleSubmitLocal}
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
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50">
                                    Proveedor *
                                </label>
                                <button
                                    type="button"
                                    onClick={onOpenNewProveedor}
                                    className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Nuevo Proveedor
                                </button>
                            </div>

                            <select
                                required
                                value={idProveedor}
                                onChange={(e) => setIdProveedor(e.target.value)}
                                className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all cursor-pointer"
                            >
                                <option value="" className="dark:bg-gray-800">-- Seleccione un Proveedor --</option>
                                {proveedores.map((p) => (
                                    <option key={p.id_proveedor} value={p.id_proveedor} className="dark:bg-gray-800">
                                        {p.nombres} {p.identificacion ? `(${p.identificacion})` : ''}
                                    </option>
                                ))}
                            </select>
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
                        onClick={onClose}
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
    );
};

export default CompraExternaModal;
