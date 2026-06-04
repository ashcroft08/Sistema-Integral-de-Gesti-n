import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";

// Components de Rutas
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
import LocksPage from "./pages/Admin/LocksPage";
import AdminSettingsPage from "./pages/Admin/SettingsPage";

// Pages Ventas / Bodega
import VentasDashboardPage from "./pages/Ventas/VentasDashboardPage";
import BodegaDashboardPage from "./pages/Bodega/BodegaDashboardPage";
import ComprasGeneralesPage from "./pages/Bodega/Cacao/ComprasGeneralesPage";
import ComprasExternasPage from "./pages/Bodega/Cacao/ComprasExternasPage";

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
          {/* === RUTAS PÚBLICAS === */}
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
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>

          {/* === RUTAS SEMI-PÚBLICAS === */}
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* === RUTAS PROTEGIDAS ADMIN === */}
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
            <Route path="tokens" element={<TokenSettingsPage />} />
            <Route path="locks" element={<LocksPage />} />
            <Route path="profile" element={<AdminSettingsPage />} />
          </Route>

          {/* === RUTAS PROTEGIDAS VENTAS === */}
          <Route
            path="/ventas"
            element={
              <ProtectedRoute
                allowedRoles={["Ventas", "Administrador", "Superusuario"]}
              />
            }
          >
            <Route index element={<VentasDashboardPage />} />
            <Route path="dashboard" element={<VentasDashboardPage />} />
          </Route>

          {/* === RUTAS PROTEGIDAS BODEGA === */}
          <Route
            path="/bodega"
            element={
              <ProtectedRoute
                allowedRoles={["Bodega", "Administrador", "Superusuario"]}
              />
            }
          >
            <Route index element={<BodegaDashboardPage />} />
            <Route path="dashboard" element={<BodegaDashboardPage />} />
            <Route path="cacao/compras-generales" element={<ComprasGeneralesPage />} />
            <Route path="cacao/compras-externas" element={<ComprasExternasPage />} />
          </Route>

          {/* === CATCH ALL === */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
