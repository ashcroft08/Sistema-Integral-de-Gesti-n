// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordSentPage from "./pages/ResetPasswordSentPage";
import CreateNewPasswordPage from "./pages/CreateNewPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";

//Pages Admin
import TokenSettingsPage from "./pages/Admin/TokenSettingsPage";
import UsersPage from "./pages/Admin/UsersPage";
import CategoriesPage from "./pages/Admin/CategoriesPage";
import LocksPage from "./pages/Admin/LocksPage";
import AdminSettingsPage from "./pages/Admin/SettingsPage";

//Pages Vendedor
import SellerSettingsPage from "./pages/Seller/SettingsPage";
import InventoryPage from "./pages/Seller/InventoryPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ToastContainer para las notificaciones */}
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
          {/* Public Routes */}
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

          {/* Update Password Route (not protected, uses tempToken) */}
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* Protected Routes para Admin*/}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["Administrador", "Superusuario"]}>
                <Routes>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="tokens" element={<TokenSettingsPage />} />
                  <Route path="locks" element={<LocksPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes para Vendedor*/}
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute allowedRoles={["Vendedor"]}>
                <Routes>
                  <Route index element={<SellerDashboardPage />} />
                  <Route path="settings" element={<SellerSettingsPage />} />
                  <Route path="inventory" element={<InventoryPage/>}/>
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
