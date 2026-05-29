import { DataTypes } from 'sequelize';
import db from '../database/database.js';
const { sequelize } = db;

// 1. Import definitions
import AuditoriaModel from './auditoria/Auditoria.js';
import ErrorModel from './auditoria/Error.js';
import EstadoUsuarioModel from './seguridad/EstadoUsuario.js';
import RolModel from './seguridad/Rol.js';
import UsuarioModel from './seguridad/Usuario.js';
import ConfiguracionBloqueoModel from './configuracion/ConfiguracionBloqueo.js';
import ConfiguracionTokenModel from './configuracion/ConfiguracionToken.js';

// Cacao Module Imports
import PeriodoCompraModel from './cacao/PeriodoCompra.js';
import CompraGeneralModel from './cacao/CompraGeneral.js';
import ComunidadMpModel from './cacao/ComunidadMp.js';
import ProveedorMpModel from './cacao/ProveedorMp.js';
import NegociadorMpModel from './cacao/NegociadorMp.js';
import CategoriaMpModel from './cacao/CategoriaMp.js';
import ProductoMpModel from './cacao/ProductoMp.js';
import CompraInternaModel from './cacao/CompraInterna.js';
import StockLoteOrgModel from './cacao/StockLoteOrg.js';
import RutaCompraModel from './cacao/RutaCompra.js';
import LoteOrgModel from './cacao/LoteOrg.js';
import LoteCvModel from './cacao/LoteCv.js';
import ControlLoteOrgModel from './cacao/ControlLoteOrg.js';
import ControlLoteCvModel from './cacao/ControlLoteCv.js';
import LoteComercializacionOrgModel from './cacao/LoteComercializacionOrg.js';
import LoteComercializacionCvModel from './cacao/LoteComercializacionCv.js';

// 2. Initialize each model
const Auditoria = AuditoriaModel(sequelize, DataTypes);
const Error = ErrorModel(sequelize, DataTypes);
const EstadoUsuario = EstadoUsuarioModel(sequelize, DataTypes);
const Rol = RolModel(sequelize, DataTypes);
const Usuario = UsuarioModel(sequelize, DataTypes);
const ConfiguracionBloqueo = ConfiguracionBloqueoModel(sequelize, DataTypes);
const ConfiguracionToken = ConfiguracionTokenModel(sequelize, DataTypes);

// Cacao Module Initialization
const PeriodoCompra = PeriodoCompraModel(sequelize, DataTypes);
const CompraGeneral = CompraGeneralModel(sequelize, DataTypes);
const ComunidadMp = ComunidadMpModel(sequelize, DataTypes);
const ProveedorMp = ProveedorMpModel(sequelize, DataTypes);
const NegociadorMp = NegociadorMpModel(sequelize, DataTypes);
const CategoriaMp = CategoriaMpModel(sequelize, DataTypes);
const ProductoMp = ProductoMpModel(sequelize, DataTypes);
const CompraInterna = CompraInternaModel(sequelize, DataTypes);
const StockLoteOrg = StockLoteOrgModel(sequelize, DataTypes);
const RutaCompra = RutaCompraModel(sequelize, DataTypes);
const LoteOrg = LoteOrgModel(sequelize, DataTypes);
const LoteCv = LoteCvModel(sequelize, DataTypes);
const ControlLoteOrg = ControlLoteOrgModel(sequelize, DataTypes);
const ControlLoteCv = ControlLoteCvModel(sequelize, DataTypes);
const LoteComercializacionOrg = LoteComercializacionOrgModel(sequelize, DataTypes);
const LoteComercializacionCv = LoteComercializacionCvModel(sequelize, DataTypes);

// 3. Group models
const models = {
    Auditoria,
    Error,
    EstadoUsuario,
    Rol,
    Usuario,
    ConfiguracionBloqueo,
    ConfiguracionToken,
    PeriodoCompra,
    CompraGeneral,
    ComunidadMp,
    ProveedorMp,
    NegociadorMp,
    CategoriaMp,
    ProductoMp,
    CompraInterna,
    StockLoteOrg,
    RutaCompra,
    LoteOrg,
    LoteCv,
    ControlLoteOrg,
    ControlLoteCv,
    LoteComercializacionOrg,
    LoteComercializacionCv
};

// 4. Run associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

// 5. Export models
export {
    Auditoria,
    Error,
    EstadoUsuario,
    Rol,
    Usuario,
    ConfiguracionBloqueo,
    ConfiguracionToken,
    PeriodoCompra,
    CompraGeneral,
    ComunidadMp,
    ProveedorMp,
    NegociadorMp,
    CategoriaMp,
    ProductoMp,
    CompraInterna,
    StockLoteOrg,
    RutaCompra,
    LoteOrg,
    LoteCv,
    ControlLoteOrg,
    ControlLoteCv,
    LoteComercializacionOrg,
    LoteComercializacionCv
};

export default db;