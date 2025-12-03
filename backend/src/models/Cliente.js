// models/cliente.js
export default (sequelize, DataTypes) => {
    const Cliente = sequelize.define('Cliente', {
        id_cliente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_tipo_identificacion: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_parroquia: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        identificacion: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        celular: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'cliente',
        schema: 'ventas',
        timestamps: false
    });

    Cliente.associate = (models) => {
        Cliente.belongsTo(models.TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Cliente.belongsTo(models.Parroquia, { foreignKey: 'id_parroquia', as: 'parroquia' });
        Cliente.hasMany(models.Factura, { foreignKey: 'id_cliente' });
    };

    return Cliente;
};