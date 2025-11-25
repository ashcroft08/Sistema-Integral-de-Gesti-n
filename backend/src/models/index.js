import { DataTypes } from 'sequelize';
// 1. Importa tu instancia de Sequelize desde tu archivo de base de datos
import db from '../database/database.js';
const { sequelize } = db;

// 2. Importa todas las definiciones de modelos de tu carpeta
import AsientoContableModel from './AsientoContable.js';
import AuditoriaModel from './Auditoria.js';
import CantonModel from './Canton.js';
import EstadoCategoriaModel  from './EstadoCategoria.js';
import CategoriaProductoModel from './CategoriaProducto.js';
import ClienteModel from './Cliente.js';
import ConfiguracionBloqueoModel from './ConfiguracionBloqueo.js';
import ConfiguracionTokenModel from './ConfiguracionToken.js';
import DetalleAsientoModel from './DetalleAsiento.js';
import DetalleFacturaModel from './DetalleFactura.js';
import ErrorModel from './Error.js';
import EstadoSriModel from './EstadoSri.js';
import EstadoUsuarioModel from './EstadoUsuario.js';
import FacturaModel from './Factura.js';
import MovimientoInventarioModel from './MovimientoInventario.js';
import PlanCuentaModel from './PlanCuenta.js';
import EstadoProductoModel  from './EstadoProducto.js';
import ProductoModel from './Producto.js';
import ProvinciaModel from './Provincia.js';
import RolModel from './Rol.js';
import TipoIdentificacionModel from './TipoIdentificacion.js';
import TipoMovimientoModel from './TipoMovimiento.js';
import UsuarioModel from './Usuario.js';
import ValorIvaModel from './ValorIva.js';

// 3. Inicializa cada modelo
const AsientoContable = AsientoContableModel(sequelize, DataTypes);
const Auditoria = AuditoriaModel(sequelize, DataTypes);
const Canton = CantonModel(sequelize, DataTypes);
const EstadoCategoria = EstadoCategoriaModel(sequelize, DataTypes);
const CategoriaProducto = CategoriaProductoModel(sequelize, DataTypes);
const Cliente = ClienteModel(sequelize, DataTypes);
const ConfiguracionBloqueo = ConfiguracionBloqueoModel(sequelize, DataTypes);
const ConfiguracionToken = ConfiguracionTokenModel(sequelize, DataTypes);
const DetalleAsiento = DetalleAsientoModel(sequelize, DataTypes);
const DetalleFactura = DetalleFacturaModel(sequelize, DataTypes);
const Error = ErrorModel(sequelize, DataTypes);
const EstadoSri = EstadoSriModel(sequelize, DataTypes);
const EstadoUsuario = EstadoUsuarioModel(sequelize, DataTypes);
const Factura = FacturaModel(sequelize, DataTypes);
const MovimientoInventario = MovimientoInventarioModel(sequelize, DataTypes);
const PlanCuenta = PlanCuentaModel(sequelize, DataTypes);
const EstadoProducto = EstadoProductoModel(sequelize, DataTypes);
const Producto = ProductoModel(sequelize, DataTypes);
const Provincia = ProvinciaModel(sequelize, DataTypes);
const Rol = RolModel(sequelize, DataTypes);
const TipoIdentificacion = TipoIdentificacionModel(sequelize, DataTypes);
const TipoMovimiento = TipoMovimientoModel(sequelize, DataTypes);
const Usuario = UsuarioModel(sequelize, DataTypes);
const ValorIva = ValorIvaModel(sequelize, DataTypes);

// 4. Agrupa todos los modelos en un objeto
// Esto permite que el bucle de asociaciones funcione
const models = {
    AsientoContable,
    Auditoria,
    Canton,
    EstadoCategoria,
    CategoriaProducto,
    Cliente,
    ConfiguracionBloqueo,
    ConfiguracionToken,
    DetalleAsiento,
    DetalleFactura,
    Error,
    EstadoSri,
    EstadoUsuario,
    Factura,
    MovimientoInventario,
    PlanCuenta,
    EstadoProducto,
    Producto,
    Provincia,
    Rol,
    TipoIdentificacion,
    TipoMovimiento,
    Usuario,
    ValorIva
};

// 5. Ejecuta el método .associate() de cada modelo (si existe)
// ¡Esto es lo que crea las relaciones (belongsTo, hasMany, etc.)!
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

// 6. Exporta todos los modelos para que tus servicios puedan usarlos
export {
    AsientoContable,
    Auditoria,
    Canton,
    EstadoCategoria,
    CategoriaProducto,
    Cliente,
    ConfiguracionBloqueo,
    ConfiguracionToken,
    DetalleAsiento,
    DetalleFactura,
    Error,
    EstadoSri,
    EstadoUsuario,
    Factura,
    MovimientoInventario,
    PlanCuenta,
    EstadoProducto,
    Producto,
    Provincia,
    Rol,
    TipoIdentificacion,
    TipoMovimiento,
    Usuario,
    ValorIva
};

// Exporta también la instancia de conexión de sequelize
export default db;