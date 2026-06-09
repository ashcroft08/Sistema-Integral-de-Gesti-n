import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { rutaCompraService } from '../../../services/rutaCompra.service';
import Breadcrumbs from './components/Breadcrumbs';

/**
 * RutaCompraModal - Reusable portal modal for creating or editing purchase routes.
 */
const RutaCompraModal = ({ isOpen, onClose, onSubmit, title, subtitle, value, setValue, submitLabel = 'Guardar' }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <form
                onSubmit={onSubmit}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                        <span className="material-symbols-outlined text-2xl text-primary">explore</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                            {title}
                        </h3>
                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 my-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                            Nombre de la Ruta de Compra *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: RUTA 1-CAPO"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2.5 outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    );
};

const RutasCompraPage = ({ onBack }) => {
    const [routes, setRoutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Field States
    const [newRouteName, setNewRouteName] = useState('');
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [editRouteName, setEditRouteName] = useState('');

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await rutaCompraService.getAll();
            if (res && res.success) {
                setRoutes(res.data || []);
            } else {
                toast.error(res.message || 'Error al cargar las rutas.');
            }
        } catch (err) {
            toast.error(err.message || 'Error de conexión.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newRouteName.trim()) return;
        try {
            const res = await rutaCompraService.create({ ruta_compra: newRouteName.trim() });
            if (res && res.success) {
                toast.success(res.message || 'Ruta creada correctamente.');
                setNewRouteName('');
                setShowCreateModal(false);
                fetchRoutes();
            } else {
                toast.error(res.message || 'Error al crear la ruta.');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Error de servidor.');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editRouteName.trim() || !selectedRoute) return;
        try {
            const res = await rutaCompraService.update(selectedRoute.id_ruta_compra, { ruta_compra: editRouteName.trim() });
            if (res && res.success) {
                toast.success(res.message || 'Ruta actualizada correctamente.');
                setShowEditModal(false);
                setSelectedRoute(null);
                setEditRouteName('');
                fetchRoutes();
            } else {
                toast.error(res.message || 'Error al actualizar la ruta.');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Error de servidor.');
        }
    };

    const handleEditClick = (route) => {
        setSelectedRoute(route);
        setEditRouteName(route.ruta_compra);
        setShowEditModal(true);
    };

    // Filtered list
    const filteredRoutes = routes.filter(r =>
        r.ruta_compra.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumbs onBack={onBack} currentPath="Rutas de Compra" />

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
                        <span className="material-symbols-outlined text-3xl text-primary font-bold">explore</span>
                        Administración de Rutas de Compra
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-background-light/50 mt-1">
                        Administra el catálogo de rutas para registrar la procedencia en los lotes de control de cacao convencional y orgánico.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Nueva Ruta
                    </button>
                </div>
            </div>

            {/* Search Bar & Stats */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 rounded-2xl border border-primary/10 dark:border-primary/20 p-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary/60 dark:text-background-light/40 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar ruta de compra por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light pl-10 pr-3.5 py-2.5 outline-none focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50">
                        Total Rutas:
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-primary/10 dark:bg-primary/20 text-sm font-bold text-primary">
                        {filteredRoutes.length}
                    </span>
                </div>
            </div>

            {/* Listing Table */}
            <div className="rounded-2xl border border-primary/15 dark:border-primary/25 bg-white/60 dark:bg-background-dark/40 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in-50 duration-200">
                {/* Table Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 dark:border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 dark:bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-xl">table_chart</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary dark:text-background-light">
                                Catálogo de Rutas de Compra
                            </h3>
                            <p className="text-xs text-text-secondary dark:text-background-light/40">
                                {filteredRoutes.length} rutas registradas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-primary/10 dark:border-primary/20">
                                <th className="bg-[#fafafa] dark:bg-[#141416] px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50">
                                    #
                                </th>
                                <th className="bg-[#fafafa] dark:bg-[#141416] px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50">
                                    Ruta de Compra
                                </th>
                                <th className="bg-[#fafafa] dark:bg-[#141416] px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/[0.06] dark:divide-primary/[0.12]">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-text-secondary dark:text-background-light/50">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-primary">autorenew</span>
                                            <span>Cargando rutas...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRoutes.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-text-secondary dark:text-background-light/50">
                                        No se encontraron rutas de compra.
                                    </td>
                                </tr>
                            ) : (
                                filteredRoutes.map((route, idx) => (
                                    <tr
                                        key={route.id_ruta_compra}
                                        className={`transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] ${
                                            idx % 2 === 0
                                                ? 'bg-transparent'
                                                : 'bg-primary/[0.015] dark:bg-primary/[0.04]'
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-xs font-mono text-text-secondary dark:text-background-light/40">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-primary dark:text-background-light whitespace-nowrap">
                                            {route.ruta_compra}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(route)}
                                                    className="p-1.5 rounded-lg border border-primary/20 dark:border-primary/30 text-text-secondary hover:text-primary hover:border-primary/45 transition-colors cursor-pointer"
                                                    title="Editar Ruta"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <RutaCompraModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setNewRouteName('');
                }}
                onSubmit={handleCreateSubmit}
                title="Nueva Ruta de Compra"
                subtitle="Registra una nueva ruta de procedencia"
                value={newRouteName}
                setValue={setNewRouteName}
                submitLabel="Registrar"
            />

            {/* Edit Modal */}
            <RutaCompraModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedRoute(null);
                    setEditRouteName('');
                }}
                onSubmit={handleEditSubmit}
                title="Editar Ruta de Compra"
                subtitle="Modifica el nombre de la ruta seleccionada"
                value={editRouteName}
                setValue={setEditRouteName}
                submitLabel="Guardar Cambios"
            />
        </div>
    );
};

export default RutasCompraPage;
