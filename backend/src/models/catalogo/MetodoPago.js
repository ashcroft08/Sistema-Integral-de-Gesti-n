export default (sequelize, DataTypes) => {
    const MetodoPago = sequelize.define('MetodoPago', {
        id_metodo_pago: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        metodo_pago: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        codigo_sri: {  // Código según tabla del SRI
            type: DataTypes.STRING(2),
            allowNull: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'metodo_pago',
        schema: 'catalogo',
        timestamps: false
    });

    MetodoPago.associate = (models) => {
        MetodoPago.hasMany(models.Factura, { foreignKey: 'id_metodo_pago' });
    };

    return MetodoPago;
};