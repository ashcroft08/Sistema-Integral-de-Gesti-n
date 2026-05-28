export default (sequelize, DataTypes) => {
    const RutaCompra = sequelize.define('RutaCompra', {
        id_ruta_compra: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ruta_compra: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'ruta_compra',
        schema: 'cacao',
        timestamps: false
    });

    RutaCompra.associate = (models) => {
        RutaCompra.hasMany(models.ControlLoteOrg, { foreignKey: 'id_ruta_compra' });
        RutaCompra.hasMany(models.ControlLoteCv, { foreignKey: 'id_ruta_compra' });
    };

    return RutaCompra;
};
