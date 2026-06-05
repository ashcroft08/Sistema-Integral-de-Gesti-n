import React from 'react';

const ComprasExternasTable = ({
    compras,
    loading,
    activeTab,
    formatDate,
    formatDecimal,
    formatCurrency,
    onEdit,
    onDelete,
    totals
}) => {
    return (
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                <thead>
                    <tr className="border-b border-primary/10 dark:border-primary/20 text-center font-bold text-text-secondary dark:text-background-light/70 uppercase tracking-wider text-xs">
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-left">Fecha</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3 text-left">Proveedor</th>
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Tipo</th>
                        {activeTab === 'financiero' ? (
                            <>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Peso Prov. (QQ)</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Peso Dif. (QQ)</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">QQ Facturadas</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Costo Unit.</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Total</th>
                            </>
                        ) : (
                            <>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Peso ASS (QQ)</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Peso AS (QQ)</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Peso Pajarito (QQ)</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Peso Basura (QQ)</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Lbs Seco</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Escurrido Lbs</th>
                                <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Escurrido QQ</th>
                            </>
                        )}
                        <th className="sticky top-0 z-10 bg-[#fafafa] dark:bg-[#141416] px-4 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={activeTab === 'financiero' ? 9 : 11} className="text-center py-10">Cargando compras...</td>
                        </tr>
                    ) : compras.length === 0 ? (
                        <tr>
                            <td colSpan={activeTab === 'financiero' ? 9 : 11} className="text-center py-10 text-text-secondary">No hay compras externas registradas en este período.</td>
                        </tr>
                    ) : (
                        compras.map((c) => (
                            <tr key={c.id_compra_externa} className="border-b border-primary/[0.06] hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors text-center text-text-primary dark:text-background-light font-medium">
                                <td className="px-4 py-3 text-left font-bold">{formatDate(c.fecha)}</td>
                                <td className="px-4 py-3 text-left">
                                    <div>
                                        <span className="font-semibold block">{c.Proveedor?.nombres}</span>
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
                                {activeTab === 'financiero' ? (
                                    <>
                                        <td className="px-4 py-3">{formatDecimal(c.peso_proveedor)}</td>
                                        <td className="px-4 py-3 text-amber-600">{formatDecimal(c.peso_diferencia)}</td>
                                        <td className="px-4 py-3 font-semibold text-primary">{formatDecimal(c.quintales_facturas)}</td>
                                        <td className="px-4 py-3">{formatCurrency(c.costo_unitario)}</td>
                                        <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(c.total)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3">{formatDecimal(c.peso_ass)}</td>
                                        <td className="px-4 py-3">{formatDecimal(c.peso_as)}</td>
                                        <td className="px-4 py-3">{formatDecimal(c.peso_pajarito)}</td>
                                        <td className="px-4 py-3">{formatDecimal(c.peso_basura)}</td>
                                        <td className="px-4 py-3">{formatDecimal(c.libras_seco)}</td>
                                        <td className="px-4 py-3">{formatDecimal(c.libras_escurrido)}</td>
                                        <td className="px-4 py-3 font-semibold text-primary">{formatDecimal(c.quintales_escurrido, 3)}</td>
                                    </>
                                )}
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onEdit(c)}
                                            className="p-1 hover:bg-primary/10 rounded-lg text-primary transition-colors cursor-pointer"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-base">edit</span>
                                        </button>
                                        <button
                                            onClick={() => onDelete(c.id_compra_externa)}
                                            className="p-1 hover:bg-red-500/10 rounded-lg text-red-600 transition-colors cursor-pointer"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
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
                            {activeTab === 'financiero' ? (
                                <>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalPesoProv)}</td>
                                    <td className="px-4 py-3 text-amber-600">{formatDecimal(totals.totalPesoDif)}</td>
                                    <td className="px-4 py-3 font-bold text-primary">{formatDecimal(totals.totalQqFacturas)}</td>
                                    <td className="px-4 py-3">—</td>
                                    <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totals.totalMontoPagar)}</td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalPesoAss)}</td>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalPesoAs)}</td>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalPesoPajarito)}</td>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalPesoBasura)}</td>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalLbsSeco)}</td>
                                    <td className="px-4 py-3">{formatDecimal(totals.totalEscLbs)}</td>
                                    <td className="px-4 py-3 font-bold text-primary">{formatDecimal(totals.totalEscQq, 3)}</td>
                                </>
                            )}
                            <td className="px-4 py-3">—</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
};

export default ComprasExternasTable;
