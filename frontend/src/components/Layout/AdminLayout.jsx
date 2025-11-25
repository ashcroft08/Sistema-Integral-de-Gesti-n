// src/components/Layout/AdminLayout.jsx
import React from "react";
import Sidebar from "../Admin/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen w-full font-display bg-background-light dark:bg-background-dark text-text-primary dark:text-background-light">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col max-w-7xl mx-auto gap-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
