// src/pages/Seller/SettingsPage.jsx
import SettingsPage from "../Admin/SettingsPage";

// El componente SettingsPage ya maneja el rol, pero puedes pasarlo explícitamente si es necesario para personalización
const SellerSettingsPage = () => {
  return <SettingsPage role="Vendedor" />;
};

export default SellerSettingsPage;
