# SIG-KALLARI: Sistema Integral de Gestión

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20PWA-61DAFB)
![Node](https://img.shields.io/badge/Backend-Express.js-339933)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow)

**SIG-KALLARI** es una Aplicación Web Progresiva (PWA) diseñada para modernizar y optimizar los procesos operativos y contables de la **Asociación KALLARI** (Tena, Ecuador). El sistema integra gestión de inventario, ventas con facturación electrónica (SRI) y un módulo contable completo, garantizando la operatividad en zonas rurales con conectividad intermitente.

## 🚀 Características Principales

### 📡 Arquitectura Offline-First
* **Funcionamiento sin conexión:** Operatividad total en módulos de ventas e inventario mediante Service Workers e IndexedDB.
* **Sincronización Inteligente:** Cola de sincronización automática que reconcilia datos locales con el servidor al recuperar la conexión.

### 🛒 Gestión Comercial y SRI
* **Facturación Electrónica:** Generación, firma y autorización de comprobantes XML conforme a la normativa del SRI (Ecuador).
* **Inventario:** Control de stock, categorías y alertas de stock mínimo.
* **Cálculo de Impuestos:** Manejo automático de productos con y sin IVA (15%) y descuentos.

### 📊 Módulo de Contabilidad Integrado
* **Automatización:** Generación automática de asientos contables (partida doble) tras cada venta autorizada.
* **Plan de Cuentas Jerárquico:** Gestión de cuentas recursivas (Activo, Pasivo, etc.).
* **Libro Diario:** Registro de asientos manuales y automáticos con validación de cuadre.
* **Reportes:** Exportación de Libro Diario y Balance de Comprobación.

### 🔮 Predicción de Demanda
* Análisis de productos más vendidos y recomendaciones de reposición basadas en históricos de venta.

---

## 🛠️ Stack Tecnológico

El proyecto sigue una arquitectura monolítica modular separada por esquemas de base de datos para seguridad y organización.

* **Frontend:** React (Vite), Redux Toolkit (Estado), Dexie.js (IndexedDB).
* **Backend:** Node.js, Express.js.
* **Base de Datos:** PostgreSQL.
* **ORM:** Sequelize.
* **Infraestructura:** Soporte PWA (Manifest, Service Workers).

---

## 🗄️ Estructura de Base de Datos

La base de datos PostgreSQL está segmentada en esquemas para garantizar la seguridad y cohesión de los datos:

1. **`seguridad`**: Usuarios, Roles, Autenticación.
2. **`ventas`**: Clientes, Facturas, Productos, Inventario (Operación diaria).
3. **`contabilidad`**: Plan de Cuentas, Asientos, Balances (Acceso restringido a Contadores).
4. **`catalogos`**: Tablas maestras (Provincias, Tipos de IVA, Estado SRI).

---

## 🔧 Instalación y Configuración

### Prerrequisitos
* Node.js v18+
* PostgreSQL v12+

### 1. Clonar el repositorio
```bash
git clone https://github.com/ashcroft08/Sistema-Integral-de-Gesti-n.git
cd sig-kallari
```
