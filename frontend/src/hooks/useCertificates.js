import { useState, useEffect } from 'react';
import { certificateService } from '../services/certificate.service';
import { toast } from 'react-toastify';

export const useCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await certificateService.getAll();
            setCertificates(response.certificados || []);
        } catch (err) {
            setError(err.message);
            toast.error('Error cargando certificados');
        } finally {
            setLoading(false);
        }
    };

    const uploadCertificate = async (file, password, nombre) => {
        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('certificado', file);
            formData.append('password', password);
            formData.append('nombre', nombre);

            const response = await certificateService.upload(formData);

            if (response.success) {
                toast.success('Certificado subido exitosamente');
                await loadCertificates();
                return { success: true };
            } else {
                toast.error(response.message || 'Error subiendo certificado');
                return { success: false, error: response.message };
            }
        } catch (err) {
            const errorMsg = err.message || 'Error subiendo certificado';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setUploading(false);
        }
    };

    const toggleCertificateStatus = async (id, currentStatus) => {
        try {
            setError(null);
            const response = currentStatus
                ? await certificateService.deactivate(id)
                : await certificateService.activate(id);

            if (response.success) {
                await loadCertificates();
                return { success: true };
            } else {
                return { success: false, error: response.message };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return {
        certificates,
        loading,
        error,
        uploading,
        uploadCertificate,
        toggleCertificateStatus,
        refetch: loadCertificates
    };
};
