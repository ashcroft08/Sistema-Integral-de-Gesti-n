export default (sequelize, DataTypes) => {
    const Cliente = sequelize.define('Cliente', {
        id_cliente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        es_empresa: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        celular: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        id_parroquia: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_estado_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'cliente',
        schema: 'ventas',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    Cliente.associate = (models) => {
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Cliente.belongsTo(models.Parroquia, { foreignKey: 'id_parroquia', as: 'parroquia' });
        Cliente.hasMany(models.Factura, { foreignKey: 'id_cliente' });
        Cliente.belongsTo(models.EstadoCliente, { foreignKey: 'id_estado_cliente', as: 'estado_cliente' });
        Cliente.hasMany(models.ClienteIdentificacion, { foreignKey: 'id_cliente' });
    };

    return Cliente;
};