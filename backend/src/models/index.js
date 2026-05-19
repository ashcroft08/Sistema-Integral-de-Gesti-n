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

// 2. Initialize each model
const Auditoria = AuditoriaModel(sequelize, DataTypes);
const Error = ErrorModel(sequelize, DataTypes);
const EstadoUsuario = EstadoUsuarioModel(sequelize, DataTypes);
const Rol = RolModel(sequelize, DataTypes);
const Usuario = UsuarioModel(sequelize, DataTypes);
const ConfiguracionBloqueo = ConfiguracionBloqueoModel(sequelize, DataTypes);
const ConfiguracionToken = ConfiguracionTokenModel(sequelize, DataTypes);

// 3. Group models
const models = {
    Auditoria,
    Error,
    EstadoUsuario,
    Rol,
    Usuario,
    ConfiguracionBloqueo,
    ConfiguracionToken
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
    ConfiguracionToken
};

export default db;