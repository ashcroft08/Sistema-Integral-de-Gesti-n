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
        id_canton: {
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
        Cliente.belongsTo(models.Canton, { foreignKey: 'id_canton' });
        Cliente.hasMany(models.Factura, { foreignKey: 'id_cliente' });
    };

    return Cliente;
};