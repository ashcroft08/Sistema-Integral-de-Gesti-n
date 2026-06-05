import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { proveedorService } from '../../../../services/proveedor.service';
import { toast } from 'react-toastify';

const validarIdentificacionEcuatoriana = (id) => {
    const cleanId = id.trim().replace(/\D/g, '');
    if (cleanId.length !== 10 && cleanId.length !== 13) return false;
    
    const prov = parseInt(cleanId.substring(0, 2), 10);
    if ((prov < 1 || prov > 24) && prov !== 30) return false;
    
    const thirdDigit = parseInt(cleanId.substring(2, 3), 10);
    
    const validarCedula = (ced) => {
        const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            let val = parseInt(ced.charAt(i), 10) * coefficients[i];
            if (val >= 10) val -= 9;
            sum += val;
        }
        const verifier = parseInt(ced.charAt(9), 10);
        const mod = sum % 10;
        const expected = mod === 0 ? 0 : 10 - mod;
        return verifier === expected;
    };

    if (cleanId.length === 10) {
        if (thirdDigit >= 6) return false;
        return validarCedula(cleanId);
    } else {
        const establishment = cleanId.substring(10, 13);
        if (establishment === '000') return false;
        
        if (thirdDigit < 6) {
            return validarCedula(cleanId.substring(0, 10));
        } else if (thirdDigit === 9) {
            const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cleanId.charAt(i), 10) * coefficients[i];
            }
            const verifier = parseInt(cleanId.charAt(9), 10);
            const mod = sum % 11;
            const expected = mod === 0 ? 0 : 11 - mod;
            return verifier === expected;
        } else if (thirdDigit === 6) {
            const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
            let sum = 0;
            for (let i = 0; i < 8; i++) {
                sum += parseInt(cleanId.charAt(i), 10) * coefficients[i];
            }
            const verifier = parseInt(cleanId.charAt(8), 10);
            const mod = sum % 11;
            const expected = mod === 0 ? 0 : 11 - mod;
            return verifier === expected;
        }
        return false;
    }
};

const ProveedorModal = ({ isOpen, onClose, onSuccess, proveedores }) => {
    const [nombres, setNombres] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [identificacion, setIdentificacion] = useState('');
    const [correo, setCorreo] = useState('');

    const handleClear = () => {
        setNombres('');
        setDireccion('');
        setTelefono('');
        setIdentificacion('');
        setCorreo('');
    };

    const handleClose = () => {
        handleClear();
        onClose();
    };

    const handleSave = async () => {
        if (!nombres.trim()) {
            toast.error('El nombre del proveedor es obligatorio.');
            return;
        }
        if (identificacion.trim()) {
            if (!validarIdentificacionEcuatoriana(identificacion)) {
                toast.error('La identificación ingresada no es una cédula o RUC ecuatoriano válido.');
                return;
            }
            const cleanNewId = identificacion.trim().replace(/\D/g, '');
            const duplicate = proveedores.some(p => p.identificacion && p.identificacion.trim().replace(/\D/g, '') === cleanNewId);
            if (duplicate) {
                toast.error('Este número de identificación ya se encuentra registrado para otro proveedor.');
                return;
            }
        }
        if (correo.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo.trim())) {
                toast.error('El correo electrónico ingresado no tiene un formato válido.');
                return;
            }
        }

        try {
            const res = await proveedorService.create({
                nombres,
                direccion,
                telefono,
                identificacion,
                correo
            });
            if (res.success && res.id_proveedor) {
                toast.success('Proveedor registrado correctamente.');
                onSuccess({
                    id_proveedor: res.id_proveedor,
                    nombres: res.nombres,
                    direccion: res.direccion,
                    telefono: res.telefono,
                    identificacion: res.identificacion,
                    correo: res.correo
                });
                handleClear();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error al registrar el proveedor');
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/10 dark:border-primary/20 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20">
                        <span className="material-symbols-outlined text-2xl text-primary">person_add</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary dark:text-background-light">
                            Nuevo Proveedor
                        </h3>
                        <p className="text-xs text-text-secondary dark:text-background-light/50">
                            Registra los datos del proveedor para la compra externa
                        </p>
                    </div>
                </div>

                <div className="space-y-4 my-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                            Nombres del Proveedor *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: Juan Pérez"
                            value={nombres}
                            onChange={(e) => setNombres(e.target.value)}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                            Dirección
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Av. de la Prensa N50"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: 0987654321"
                                maxLength={10}
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                                Identificación
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: RUC o Cédula"
                                value={identificacion}
                                onChange={(e) => setIdentificacion(e.target.value)}
                                className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-background-light/50 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="Ej: proveedor@correo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full rounded-xl border border-primary/20 dark:border-primary/30 bg-transparent text-sm text-text-primary dark:text-background-light px-3.5 py-2 outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-end border-t border-primary/10 pt-4 mt-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium rounded-xl border border-primary/20 dark:border-primary/30 text-text-primary dark:text-background-light hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Registrar Proveedor
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProveedorModal;
