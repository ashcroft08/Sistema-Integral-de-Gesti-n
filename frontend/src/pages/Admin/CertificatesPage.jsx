import React, { useState, useEffect } from "react";
import { useCertificates } from "../../hooks/useCertificates";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/ui/Button";
import Table from "../../components/UI/Table";
import TablePagination from "../../components/UI/TablePagination";
import CertificateUploadModal from "../../components/ui/CertificateUploadModal";
import CertificateStatusModal from "../../components/ui/CertificateStatusModal";
import { toast } from "react-toastify";

const CertificatesPage = () => {
  const {
    certificates,
    loading,
    error,
    uploading,
    uploadCertificate,
    toggleCertificateStatus,
  } = useCertificates();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Filtrado
  const filteredCertificates = certificates.filter((cert) => {
    const term = searchTerm.toLowerCase();
    const nombre = cert.nombre ? cert.nombre.toLowerCase() : "";
    const emisor = cert.emisor ? cert.emisor.toLowerCase() : "";

    const matchesSearch = nombre.includes(term) || emisor.includes(term);

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = cert.activo === true;
    if (statusFilter === "inactive") matchesStatus = cert.activo === false;
    if (statusFilter === "expired") matchesStatus = cert.estado === "expirado";
    if (statusFilter === "expiring")
      matchesStatus = cert.estado === "por_expirar";

    return matchesSearch && matchesStatus;
  });

  // Ordenamiento
  const sortedCertificates = [...filteredCertificates];
  if (sortConfig.key) {
    sortedCertificates.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "diasRestantes") {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCertificates = sortedCertificates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalItems = sortedCertificates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handlers
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
            ? "Certificado desactivado correctamente"
            : "Certificado activado correctamente"
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

  const getStatusBadge = (estado) => {
    const badges = {
      vigente: { color: "green", text: "Vigente", icon: "check_circle" },
      por_expirar: { color: "yellow", text: "Por Expirar", icon: "warning" },
      expirado: { color: "red", text: "Expirado", icon: "cancel" },
    };
    const badge = badges[estado] || badges.vigente;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-${badge.color}-100 text-${badge.color}-800 dark:bg-${badge.color}-900/30 dark:text-${badge.color}-400`}
      >
        <span className="material-symbols-outlined text-sm">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  // Columnas
  const columns = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
            badge
          </span>
          <div>
            <p className="font-medium text-text-primary dark:text-background-light">
              {row.nombre}
            </p>
            <p className="text-xs text-text-secondary dark:text-background-light/70">
              {row.emisor}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Expiración",
      accessorKey: "fecha_expiracion",
      sortable: true,
      render: (row) => (
        <div className="text-sm">
          <p className="text-text-primary dark:text-background-light">
            {new Date(row.fecha_expiracion).toLocaleDateString("es-EC")}
          </p>
          <p
            className={`text-xs font-semibold ${
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
      render: (row) => getStatusBadge(row.estado),
    },
    {
      header: "Activo",
      accessorKey: "activo",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            row.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
          }`}
        >
          {row.activo ? "Sí" : "No"}
        </span>
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
          disabled={actionLoading}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Certificados Digitales
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Gestiona los certificados de firma electrónica para facturación SRI.
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 min-w-[180px] justify-center"
          disabled={loading || uploading}
        >
          <span className="material-symbols-outlined">upload</span>
          {uploading ? "Subiendo..." : "Subir Certificado"}
        </Button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              search
            </span>
            <input
              type="search"
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="expiring">Por Expirar</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white dark:bg-background-dark/40 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={currentCertificates}
            isLoading={loading}
            keyField="id_certificado"
            sortConfig={sortConfig}
            onSort={handleSort}
            pagination={
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                limit={itemsPerPage}
                onLimitChange={(newLimit) => {
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                }}
                totalItems={totalItems}
                showingFrom={indexOfFirstItem + 1}
                showingTo={Math.min(indexOfLastItem, totalItems)}
              />
            }
            emptyText="No hay certificados configurados."
          />
        </div>
      </div>

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
