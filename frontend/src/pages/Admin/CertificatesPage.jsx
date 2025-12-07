import React, { useState, useEffect } from "react";
import { useCertificates } from "../../hooks/useCertificates";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Table from "../../components/UI/Table";
import CertificateUploadModal from "../../components/UI/CertificateUploadModal";
import CertificateStatusModal from "../../components/UI/CertificateStatusModal";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Upload,
  History,
} from "lucide-react";
import { toast } from "react-toastify";

const CertificatesPage = () => {
  const {
    certificates,
    loading,
    uploading,
    uploadCertificate,
    toggleCertificateStatus,
  } = useCertificates();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Obtener certificado activo
  const activeCert = certificates.find((c) => c.activo);

  const handleUpload = async (file, password, nombre) => {
    const result = await uploadCertificate(file, password, nombre);
    if (result.success) {
      setIsUploadModalOpen(false);
    }
    return result;
  };

  const openStatusModal = (cert) => {
    setCurrentCertificate(cert);
    setIsStatusModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!currentCertificate) return;
    setActionLoading(true);

    try {
      const result = await toggleCertificateStatus(
        currentCertificate.id_certificado,
        currentCertificate.activo
      );

      if (result.success) {
        toast.success(
          currentCertificate.activo
            ? "Certificado desactivado"
            : "Certificado activado. Los demás fueron desactivados automáticamente."
        );
        setIsStatusModalOpen(false);
        setCurrentCertificate(null);
      } else {
        toast.error(result.error || "Error al cambiar el estado");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (estado) => {
    return estado === "vigente"
      ? "green"
      : estado === "por_expirar"
      ? "yellow"
      : "red";
  };

  const getStatusIcon = (estado) => {
    if (estado === "vigente") return <CheckCircle className="w-4 h-4" />;
    if (estado === "por_expirar") return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  // Columnas para historial
  const columns = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Shield
            className={`w-5 h-5 ${
              row.activo ? "text-blue-600" : "text-gray-400"
            }`}
          />
          <div>
            <p
              className={`font-medium ${
                row.activo
                  ? "text-text-primary dark:text-background-light"
                  : "text-gray-500"
              }`}
            >
              {row.nombre}
            </p>
            {row.emisor && (
              <p className="text-xs text-text-secondary dark:text-background-light/70">
                {row.emisor}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Expiración",
      accessorKey: "fecha_expiracion",
      render: (row) => (
        <div className="text-sm">
          <div className="flex items-center gap-2 text-text-primary dark:text-background-light">
            <Calendar className="w-4 h-4" />
            {new Date(row.fecha_expiracion).toLocaleDateString("es-EC")}
          </div>
          <p
            className={`text-xs font-semibold mt-1 ${
              row.diasRestantes < 0
                ? "text-red-600"
                : row.diasRestantes < 30
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {row.diasRestantes < 0 ? "Expirado" : `${row.diasRestantes} días`}
          </p>
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      render: (row) => {
        const color = getStatusColor(row.estado);
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400`}
          >
            {getStatusIcon(row.estado)}
            {row.estado === "vigente"
              ? "Vigente"
              : row.estado === "por_expirar"
              ? "Por Expirar"
              : "Expirado"}
          </span>
        );
      },
    },
    {
      header: "Activo",
      accessorKey: "activo",
      render: (row) => (
        <div className="text-center">
          {row.activo ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <CheckCircle className="w-3 h-3" />
              En Uso
            </span>
          ) : (
            <span className="text-gray-400 text-xs">Inactivo</span>
          )}
        </div>
      ),
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => openStatusModal(row)}
          className={`p-2 rounded-lg transition-colors ${
            row.activo
              ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
          }`}
          title={row.activo ? "Desactivar" : "Activar"}
          disabled={actionLoading || (row.estado === "expirado" && !row.activo)}
        >
          <span className="material-symbols-outlined text-lg">
            {row.activo ? "toggle_off" : "toggle_on"}
          </span>
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Certificado Digital
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Gestiona el certificado de firma electrónica para facturación SRI
          </p>
        </div>
      </div>

      {/* ======================================== */}
      {/* WIDGET GRANDE - CERTIFICADO ACTIVO */}
      {/* ======================================== */}
      <div className="mb-8">
        {!activeCert ? (
          // Sin certificado activo
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                  Sin Certificado Digital Activo
                </h2>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  No puedes emitir facturas electrónicas sin un certificado
                  digital válido del SRI. Sube tu certificado .p12 para comenzar
                  a facturar.
                </p>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir Certificado
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Con certificado activo
          <div
            className={`bg-gradient-to-r ${
              activeCert.estado === "vigente"
                ? "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700"
                : activeCert.estado === "por_expirar"
                ? "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700"
                : "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700"
            } border-2 rounded-xl p-6 shadow-lg`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full ${
                  activeCert.estado === "vigente"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : activeCert.estado === "por_expirar"
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <Shield
                  className={`w-8 h-8 ${
                    activeCert.estado === "vigente"
                      ? "text-green-600 dark:text-green-400"
                      : activeCert.estado === "por_expirar"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {activeCert.nombre}
                    </h2>
                    {activeCert.emisor && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Emisor: {activeCert.emisor}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold ${
                      activeCert.estado === "vigente"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                        : activeCert.estado === "por_expirar"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    }`}
                  >
                    {getStatusIcon(activeCert.estado)}
                    {activeCert.estado === "vigente"
                      ? "Certificado Vigente"
                      : activeCert.estado === "por_expirar"
                      ? "Por Expirar"
                      : "Expirado"}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Fecha de Emisión
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(activeCert.fecha_emision).toLocaleDateString(
                        "es-EC"
                      )}
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Fecha de Expiración
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(activeCert.fecha_expiracion).toLocaleDateString(
                        "es-EC"
                      )}
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Días Restantes
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        activeCert.diasRestantes < 0
                          ? "text-red-600"
                          : activeCert.diasRestantes < 30
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {activeCert.diasRestantes < 0
                        ? "Expirado"
                        : `${activeCert.diasRestantes} días`}
                    </p>
                  </div>
                </div>

                {activeCert.estado === "por_expirar" && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ <strong>Atención:</strong> Tu certificado expirará en{" "}
                      {activeCert.diasRestantes} días. Considera renovarlo
                      pronto para evitar interrupciones en la facturación.
                    </p>
                  </div>
                )}

                {activeCert.estado === "expirado" && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      ❌ <strong>Certificado Expirado:</strong> No puedes emitir
                      facturas con un certificado vencido. Sube un nuevo
                      certificado inmediatamente.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    variant="secondary"
                    className="inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Renovar Certificado
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================== */}
      {/* HISTORIAL DE CERTIFICADOS */}
      {/* ======================================== */}
      {certificates.length > 0 && (
        <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Historial de Certificados ({certificates.length})
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Todos los certificados que has subido, incluidos los expirados
            </p>
          </div>

          <Table
            columns={columns}
            data={certificates}
            isLoading={loading}
            keyField="id_certificado"
            emptyText="No hay certificados en el historial."
          />
        </div>
      )}

      {/* MODALES */}
      <CertificateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        isLoading={uploading}
      />

      <CertificateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => !actionLoading && setIsStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        certificate={currentCertificate}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
};

export default CertificatesPage;
