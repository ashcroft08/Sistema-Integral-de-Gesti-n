import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
// Descomenta la siguiente línea en tu proyecto local para los estilos de las notificaciones
// import "react-toastify/dist/ReactToastify.css";

// Components de Rutas
// Asegúrate de que estos archivos estén en src/components/
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// Pages Publicas / Auth
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordSentPage from "./pages/ResetPasswordSentPage";
import CreateNewPasswordPage from "./pages/CreateNewPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";

// Pages Admin
import AdminDashboardPage from "./pages/AdminDashboardPage";
import TokenSettingsPage from "./pages/Admin/TokenSettingsPage";
import UsersPage from "./pages/Admin/UsersPage";
import CategoriesPage from "./pages/Admin/CategoriesPage";
import LocksPage from "./pages/Admin/LocksPage";
import AdminSettingsPage from "./pages/Admin/SettingsPage";

// Pages Vendedor
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerSettingsPage from "./pages/Seller/SettingsPage";
import InventoryPage from "./pages/Seller/InventoryPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {/* === RUTAS PÚBLICAS (Con restricción inversa) ===
              PublicRoute redirige al dashboard si el usuario YA está logueado.
              Si no, muestra el Outlet (LoginPage, etc.)
          */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password-sent"
              element={<ResetPasswordSentPage />}
            />
            <Route
              path="/reset-password/:token"
              element={<CreateNewPasswordPage />}
            />
            {/* Redirección por defecto: Si entran a la raíz, van al login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* === RUTAS SEMI-PÚBLICAS === 
              Rutas que son accesibles sin validación estricta de roles, 
              o que manejan su propia lógica interna
          */}
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* === RUTAS PROTEGIDAS ADMIN ===
              Solo accesibles para Administrador y Superusuario.
              ProtectedRoute renderiza un <Outlet /> donde se cargan estas rutas hijas.
          */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["Administrador", "Superusuario"]}
              />
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tokens" element={<TokenSettingsPage />} />
            <Route path="locks" element={<LocksPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* === RUTAS PROTEGIDAS VENDEDOR ===
              Solo accesibles para Vendedor.
          */}
          <Route
            path="/seller"
            element={<ProtectedRoute allowedRoles={["Vendedor"]} />}
          >
            <Route index element={<SellerDashboardPage />} />
            <Route path="settings" element={<SellerSettingsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>

          {/* === CATCH ALL ===
              Cualquier ruta desconocida redirige al login
          */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
