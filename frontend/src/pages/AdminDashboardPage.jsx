// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/Layout/AdminLayout";
import DashboardStats from "../components/Admin/DashboardStats";
import Button from "../components/UI/Button";
import axiosInstance from "../services/axios";
import { categoryService } from "../services/category.service";
import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Para estadísticas completas
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchCategories()]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      if (response.data.success) {
        const allUsersData = response.data.usuarios || [];
        setAllUsers(allUsersData);
        // Ordenar usuarios por id (más recientes primero) y tomar los primeros 10
        const sortedUsers = allUsersData
          .sort((a, b) => b.id_usuario - a.id_usuario)
          .slice(0, 10);
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar los usuarios');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.categorias || []);
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // No establecer error global, solo log
    }
  };

  // Formatear nombre completo
  const getFullName = (user) => {
    return `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Sin nombre';
  };

  // Obtener color del estado
  const getStatusColor = (estado) => {
    if (estado === 'Activo' || estado === 1) {
      return "bg-green-500/10 text-green-500 dark:bg-green-500/20";
    }
    return "bg-red-500/10 text-red-500 dark:bg-red-500/20";
  };

  // Acciones rápidas
  const quickActions = [
    {
      title: "Gestionar Usuarios",
      description: "Ver y administrar todos los usuarios del sistema",
      icon: "manage_accounts",
      link: "/admin/users",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      title: "Gestionar Categorías",
      description: "Crear y editar categorías de productos",
      icon: "category",
      link: "/admin/categories",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      title: "Configuración de Tokens",
      description: "Administrar tokens del sistema",
      icon: "token",
      link: "/admin/tokens",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      title: "Gestión de Bloqueos",
      description: "Ver y gestionar bloqueos de usuarios",
      icon: "lock_clock",
      link: "/admin/locks",
      color: "bg-red-500/10 text-red-600 dark:text-red-400"
    }
  ];

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary dark:text-background-light">
            Dashboard del Administrador
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal dark:text-background-light/70">
            Resumen general del sistema y acceso rápido a las principales funciones.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/admin/categories">
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">category</span>
              Categorías
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button className="inline-flex items-center gap-2 px-4 py-2 text-sm">
              <span className="material-symbols-outlined text-lg">person_add</span>
              Nuevo Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="mb-8">
        <DashboardStats users={allUsers} categories={categories} />
      </div>

      {/* Acciones Rápidas */}
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-text-primary dark:text-background-light mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group rounded-xl border border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30 p-6 hover:shadow-lg transition-all hover:border-primary/40"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${action.color}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {action.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary dark:text-background-light mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-text-secondary/70 dark:text-background-light/50">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabla de Usuarios Recientes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-2xl font-bold text-text-primary dark:text-background-light">
            Usuarios Recientes
          </h2>
          <Link to="/admin/users">
            <Button variant="outline" className="text-sm px-4 py-2">
              Ver Todos
              <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12 text-text-secondary">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
            <p>Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-primary/20 bg-white/50 dark:bg-background-dark/50 dark:border-primary/30">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-primary/20 bg-background-light/50 dark:bg-background-dark/30 text-text-secondary dark:border-primary/30 dark:text-background-light/70">
                <tr>
                  <th className="px-6 py-3 font-medium" scope="col">
                    Nombres
                  </th>
                  <th className="px-6 py-3 font-medium" scope="col">
                    Email
                  </th>
                  <th className="px-6 py-3 font-medium" scope="col">
                    Rol
                  </th>
                  <th className="px-6 py-3 font-medium" scope="col">
                    Estado
                  </th>
                  <th className="px-6 py-3 font-medium" scope="col">
                    Primer Ingreso
                  </th>
                  <th className="px-6 py-3 font-medium" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr
                    key={userItem.id_usuario}
                    className="border-b border-primary/20 dark:border-primary/30 hover:bg-background-light/30 dark:hover:bg-background-dark/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary dark:text-background-light">
                      {getFullName(userItem)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary dark:text-background-light/70">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          {userItem.Rol?.rol === 'Vendedor' ? 'storefront' : 
                           userItem.Rol?.rol === 'Contador' ? 'receipt_long' : 
                           'admin_panel_settings'}
                        </span>
                        {userItem.Rol?.rol || 'Sin rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(userItem.EstadoUsuario?.estado_usuario || userItem.id_estado_usuario)}`}
                      >
                        {userItem.EstadoUsuario?.estado_usuario || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${userItem.primer_ingreso
                          ? "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                          : "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                          }`}
                      >
                        {userItem.primer_ingreso ? "Pendiente" : "Completado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/users`}
                        className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 text-sm"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
