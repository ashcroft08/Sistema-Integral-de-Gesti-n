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
import CategoriesPage from "./pages/Admin/CategoriesPage";
import LocksPage from "./pages/Admin/LocksPage";
import AdminSettingsPage from "./pages/Admin/SettingsPage";
import DiscountPage from "./pages/Admin/DiscountPage";
import IvaPage from "./pages/Admin/IvaPage";
import CertificatesPage from "./pages/Admin/CertificatesPage";

// Pages Vendedor
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerSettingsPage from "./pages/Seller/SettingsPage";
import InventoryPage from "./pages/Seller/InventoryPage";
import ClientsPage from "./pages/Seller/ClientsPage";
import SalesPage from "./pages/Seller/SalesPage";
import CheckoutPage from "./pages/Seller/CheckoutPage";
import SaleSuccessPage from "./pages/Seller/SaleSuccessPage";

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
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tokens" element={<TokenSettingsPage />} />
            <Route path="locks" element={<LocksPage />} />
            <Route path="discounts" element={<DiscountPage />} />
            <Route path="taxes" element={<IvaPage />} />
            <Route path="profile" element={<AdminSettingsPage />} />
            <Route path="certificate" element={<CertificatesPage />} />
          </Route>

          {/* === RUTAS PROTEGIDAS VENDEDOR === */}
          <Route
            path="/seller"
            element={<ProtectedRoute allowedRoles={["Vendedor"]} />}
          >
            <Route index element={<SellerDashboardPage />} />
            <Route path="profile" element={<SellerSettingsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            {/* 👇 Nueva ruta de categorías - accesible por URL pero sidebar lo oculta para vendedores */}
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="sale-success" element={<SaleSuccessPage />} />
          </Route>

          {/* === CATCH ALL === */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
