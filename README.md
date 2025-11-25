# SIG-KALLARI: Sistema Integral de Gestión

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20PWA-61DAFB)
![Node](https://img.shields.io/badge/Backend-Express.js-339933)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow)

**SIG-KALLARI** es una Aplicación Web Progresiva (PWA) diseñada para modernizar y optimizar los procesos operativos y contables de la **Asociación KALLARI** (Tena, Ecuador). [cite_start]El sistema integra gestión de inventario, ventas con facturación electrónica (SRI) y un módulo contable completo, garantizando la operatividad en zonas rurales con conectividad intermitente[cite: 33, 35, 426].

## 🚀 Características Principales

### 📡 Arquitectura Offline-First
* [cite_start]**Funcionamiento sin conexión:** Operatividad total en módulos de ventas e inventario mediante Service Workers e IndexedDB[cite: 66, 96].
* [cite_start]**Sincronización Inteligente:** Cola de sincronización automática que reconcilia datos locales con el servidor al recuperar la conexión[cite: 68, 128].

### 🛒 Gestión Comercial y SRI
* [cite_start]**Facturación Electrónica:** Generación, firma y autorización de comprobantes XML conforme a la normativa del SRI (Ecuador)[cite: 112, 113].
* [cite_start]**Inventario:** Control de stock, categorías y alertas de stock mínimo[cite: 98, 99].
* [cite_start]**Cálculo de Impuestos:** Manejo automático de productos con y sin IVA (15%) y descuentos[cite: 103, 314].

### 📊 Módulo de Contabilidad Integrado
* [cite_start]**Automatización:** Generación automática de asientos contables (partida doble) tras cada venta autorizada[cite: 117, 344].
* [cite_start]**Plan de Cuentas Jerárquico:** Gestión de cuentas recursivas (Activo, Pasivo, etc.)[cite: 116, 340].
* [cite_start]**Libro Diario:** Registro de asientos manuales y automáticos con validación de cuadre[cite: 118, 349].
* [cite_start]**Reportes:** Exportación de Libro Diario y Balance de Comprobación[cite: 119].

### 🔮 Predicción de Demanda
* [cite_start]Análisis de productos más vendidos y recomendaciones de reposición basadas en históricos de venta[cite: 120, 123].

---

## 🛠️ Stack Tecnológico

El proyecto sigue una arquitectura monolítica modular separada por esquemas de base de datos para seguridad y organización.

* **Frontend:** React (Vite), Redux Toolkit (Estado), Dexie.js (IndexedDB).
* **Backend:** Node.js, Express.js.
* **Base de Datos:** PostgreSQL.
* **ORM:** Sequelize.
* [cite_start]**Infraestructura:** Soporte PWA (Manifest, Service Workers)[cite: 147, 148, 149].

---

## 🗄️ Estructura de Base de Datos

La base de datos PostgreSQL está segmentada en esquemas para garantizar la seguridad y cohesión de los datos:

1.  **`seguridad`**: Usuarios, Roles, Autenticación.
2.  **`ventas`**: Clientes, Facturas, Productos, Inventario (Operación diaria).
3.  **`contabilidad`**: Plan de Cuentas, Asientos, Balances (Acceso restringido a Contadores).
4.  **`catalogos`**: Tablas maestras (Provincias, Tipos de IVA, Estado SRI).

---

## 🔧 Instalación y Configuración

### Prerrequisitos
* Node.js v18+
* PostgreSQL v12+

### 1. Clonar el repositorio
```bash
git clone [https://github.com/usuario/sig-kallari.git](https://github.com/usuario/sig-kallari.git)
cd sig-kallari
