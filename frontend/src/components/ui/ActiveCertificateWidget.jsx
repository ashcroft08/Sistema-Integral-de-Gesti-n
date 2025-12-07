import React, { useState, useEffect } from "react";
import axiosInstance from "../services/axios";
import { Shield, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

const ActiveCertificateWidget = () => {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveCertificate();
  }, []);

  const loadActiveCertificate = async () => {
    try {
      const response = await axiosInstance.get("/certificates/active");
      if (response.data.success) {
        setCert(response.data.certificado);
      }
    } catch (error) {
      console.error("Error cargando certificado:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Sin Certificado Activo</p>
            <p className="text-sm text-red-700 mt-1">
              No puedes emitir facturas sin un certificado digital.
              <a href="/admin/certificates" className="underline ml-1">
                Subir certificado
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (estado) => {
    if (estado === "expirado") return "red";
    if (estado === "por_expirar") return "yellow";
    return "green";
  };

  const statusColor = getStatusColor(cert.estado);

  return (
    <div
      className={`p-4 bg-${statusColor}-50 border-l-4 border-${statusColor}-500 rounded-lg`}
    >
      <div className="flex items-start gap-3">
        <Shield
          className={`w-5 h-5 text-${statusColor}-600 flex-shrink-0 mt-0.5`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{cert.nombre}</p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}
            >
              {cert.estado === "vigente" && <CheckCircle className="w-3 h-3" />}
              {cert.estado === "por_expirar" && (
                <AlertTriangle className="w-3 h-3" />
              )}
              {cert.estado === "vigente"
                ? "Vigente"
                : cert.estado === "por_expirar"
                ? "Por Expirar"
                : "Expirado"}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                Expira:{" "}
                {new Date(cert.fecha_expiracion).toLocaleDateString("es-EC")}
              </span>
            </div>
            <span
              className={`font-semibold ${
                cert.diasRestantes < 0
                  ? "text-red-600"
                  : cert.diasRestantes < 30
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {cert.diasRestantes < 0
                ? "Expirado"
                : `${cert.diasRestantes} días restantes`}
            </span>
          </div>

          {cert.estado === "por_expirar" && (
            <p className="text-xs text-yellow-700 mt-2">
              ⚠️ Considera renovar el certificado pronto para evitar
              interrupciones.
            </p>
          )}

          {cert.estado === "expirado" && (
            <p className="text-xs text-red-700 mt-2">
              ❌ No puedes emitir facturas con un certificado expirado.
              <a href="/admin/certificates" className="underline ml-1">
                Subir nuevo certificado
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveCertificateWidget;
