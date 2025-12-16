// models/clienteIdentificacion.js
export default (sequelize, DataTypes) => {
    const ClienteIdentificacion = sequelize.define('ClienteIdentificacion', {
        id_cliente_identificacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_tipo_identificacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        identificacion: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        es_principal: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'cliente_identificacion',
        schema: 'ventas',
        timestamps: false,
    });

    ClienteIdentificacion.associate = (models) => {
        ClienteIdentificacion.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
        ClienteIdentificacion.belongsTo(models.TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
    }

    return ClienteIdentificacion;
}