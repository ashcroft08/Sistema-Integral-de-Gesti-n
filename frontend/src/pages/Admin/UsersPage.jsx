// src/pages/Admin/UsersPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../hooks/useUsers";
import AdminLayout from "../../components/Layout/AdminLayout";
import Button from "../../components/UI/Button";
import Table from "../../components/UI/Table";
import UserFormModal from "../../components/UI/UserFormModal";
import StatusConfirmationModal from "../../components/UI/StatusConfirmationModal";
import { toast } from "react-toastify";
import { ESTADOS_USUARIO } from "../../constants/statuses";

const UsersPage = () => {
  const { user } = useAuth();
  const {
    users,
    roles,
    statuses,
    loading,
    error,
    createUser,
    updateUser,
    changeUserStatus,
    deleteUser,
  } = useUsers();

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userToChangeStatus, setUserToChangeStatus] = useState(null);
  const [statusAction, setStatusAction] = useState("");
  const [initialLoadError, setInitialLoadError] = useState(null);

  // ✨ HELPERS SEMÁNTICOS
  const isUserActive = (userItem) =>
    userItem?.EstadoUsuario?.codigo === ESTADOS_USUARIO.ACTIVO;
  const isUserInactive = (userItem) =>
    userItem?.EstadoUsuario?.codigo === ESTADOS_USUARIO.INACTIVO;
  const isUserBlocked = (userItem) =>
    userItem?.EstadoUsuario?.codigo === ESTADOS_USUARIO.BLOQUEADO;

  // --- LÓGICA DE FILTRADO ---
  const filteredUsers = useMemo(() => {
    return users.filter((userItem) => {
      const fullName = `${userItem.nombre || ""} ${
        userItem.apellido || ""
      }`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userItem.Rol?.rol.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "all" || userItem.Rol?.rol === roleFilter;

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = isUserActive(userItem);
      if (statusFilter === "inactive") matchesStatus = isUserInactive(userItem);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // --- LÓGICA DE ORDENAMIENTO ---
  const sortedUsers = useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key]
          ? a[sortConfig.key].toString().toLowerCase()
          : "";
        let bValue = b[sortConfig.key]
          ? b[sortConfig.key].toString().toLowerCase()
          : "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // --- HANDLERS ---
  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (userItem) => {
    setCurrentUser(userItem);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.id_usuario) {
        await updateUser(userData.id_usuario, userData);
        toast.success("Usuario actualizado exitosamente");
      } else {
        await createUser(userData);
        toast.success("Usuario creado exitosamente");
      }
      setIsModalOpen(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || "Error al guardar usuario";
      toast.error(errorMessage);
      return { success: false, errors: err.cause || { general: errorMessage } };
    }
  };

  const openStatusModal = (userItem, action) => {
    setUserToChangeStatus(userItem);
    setStatusAction(action);
    setIsStatusModalOpen(true);
  };

  const handleChangeStatus = async () => {
    if (!userToChangeStatus) return;
    try {
      // Opción Eliminar (Física) - Solo si decides habilitarla en el futuro para inactivos
      if (statusAction === "delete") {
        await deleteUser(userToChangeStatus.id_usuario);
        toast.success("Usuario eliminado permanentemente");
        setIsStatusModalOpen(false);
        return;
      }

      // Lógica Activar/Desactivar
      let targetStatusCode = "";
      if (statusAction === "activate")
        targetStatusCode = ESTADOS_USUARIO.ACTIVO;
      if (statusAction === "deactivate")
        targetStatusCode = ESTADOS_USUARIO.INACTIVO;

      const targetStatus = statuses.find((s) => s.codigo === targetStatusCode);

      if (!targetStatus) {
        throw new Error("No se pudo determinar el ID del estado destino.");
      }

      await changeUserStatus(userToChangeStatus.id_usuario, {
        id_estado_usuario: targetStatus.id_estado_usuario,
      });

      toast.success(
        `Usuario ${
          statusAction === "activate" ? "activado" : "desactivado"
        } exitosamente`
      );
      setIsStatusModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del usuario");
    }
  };

  const getStatusInfo = (statusCode) => {
    switch (statusCode) {
      case ESTADOS_USUARIO.ACTIVO:
        return {
          text: "Activo",
          class:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
      case ESTADOS_USUARIO.INACTIVO:
        return {
          text: "Inactivo",
          class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
      case ESTADOS_USUARIO.BLOQUEADO:
        return {
          text: "Bloqueado",
          class:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        };
      default:
        return { text: "Desconocido", class: "bg-gray-100 text-gray-800" };
    }
  };

  // --- COLUMNAS ---
  const columnsConfig = [
    {
      header: "Nombre",
      accessorKey: "nombre",
      sortable: true,
      className: "font-medium text-text-primary dark:text-background-light",
      render: (row) => `${row.nombre} ${row.apellido}`,
    },
    {
      header: "Email",
      accessorKey: "email",
      sortable: true,
      className: "text-text-secondary dark:text-background-light/80 break-all",
    },
    {
      header: "Rol",
      className: "text-text-secondary dark:text-background-light/80",
      render: (row) => row.Rol?.rol || "Sin rol",
    },
    {
      header: "Estado",
      render: (row) => {
        const statusInfo = getStatusInfo(row.EstadoUsuario?.codigo);
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusInfo.class}`}
          >
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (row) => {
        // ✨ LÓGICA CORREGIDA: Prioridad a Activar/Desactivar
        return (
          <div className="inline-flex items-center justify-end gap-2">
            {/* Botón Editar */}
            <button
              onClick={() => handleEditUser(row)}
              className="p-2 text-text-secondary/80 hover:text-blue-600 dark:text-background-light/70 dark:hover:text-blue-400 rounded-lg transition-colors"
              title="Editar usuario"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>

            {/* Botón de Estado (Switch lógico) */}
            {isUserActive(row) ? (
              // Si está ACTIVO -> Botón DESACTIVAR (Naranja/Ámbar)
              // Ya no usamos "Eliminar" aquí
              <button
                onClick={() => openStatusModal(row, "deactivate")}
                className="p-2 text-text-secondary/80 hover:text-orange-600 dark:text-background-light/70 dark:hover:text-orange-400 rounded-lg transition-colors"
                title="Desactivar usuario"
              >
                <span className="material-symbols-outlined text-lg">
                  person_off
                </span>
              </button>
            ) : (
              // Si está INACTIVO/BLOQUEADO -> Botón ACTIVAR (Verde)
              <button
                onClick={() => openStatusModal(row, "activate")}
                className="p-2 text-text-secondary/80 hover:text-green-600 dark:text-background-light/70 dark:hover:text-green-400 rounded-lg transition-colors"
                title="Activar usuario"
              >
                <span className="material-symbols-outlined text-lg">
                  how_to_reg
                </span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // --- ERROR HANDLING ---
  useEffect(() => {
    if (error && !loading && users.length === 0) {
      setInitialLoadError(error);
    } else {
      setInitialLoadError(null);
    }
  }, [error, loading, users.length]);

  if (initialLoadError && !loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-red-500">
          Error: {initialLoadError}
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Gestión de Usuarios
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Busca, visualiza, edita y gestiona todos los usuarios del sistema.
          </p>
        </div>
        <Button
          onClick={handleAddUser}
          className="inline-flex items-center gap-2 px-6 py-3 min-w-[180px] justify-center"
          disabled={loading}
        >
          <span className="material-symbols-outlined">person_add</span>
          {loading ? "Cargando..." : "Registrar Nuevo Usuario"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80">
              search
            </span>
            <input
              type="search"
              className="w-full rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-4 text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light dark:placeholder:text-background-light/60"
              placeholder="Buscar por nombre, email o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              {[...new Set(users.map((user) => user.Rol?.rol))]
                .filter(Boolean)
                .map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </select>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/80 pointer-events-none">
              filter_list
            </span>
            <select
              className="w-full appearance-none rounded-lg border border-primary/30 bg-white/50 py-2 pl-10 pr-8 text-text-primary focus:border-primary focus:ring-primary dark:border-primary/40 dark:bg-background-dark/50 dark:text-background-light sm:w-auto cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        <Table
          columns={columnsConfig}
          data={sortedUsers}
          isLoading={loading}
          keyField="id_usuario"
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={currentUser}
        roles={roles}
      />
      <StatusConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleChangeStatus}
        user={userToChangeStatus}
        action={statusAction}
      />
    </AdminLayout>
  );
};

export default UsersPage;
