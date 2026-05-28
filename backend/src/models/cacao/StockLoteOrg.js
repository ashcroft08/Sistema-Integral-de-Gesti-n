export default (sequelize, DataTypes) => {
    const StockLoteOrg = sequelize.define('StockLoteOrg', {
        id_stock_lote_org: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_compra_interna: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad_asignada: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        fecha_registro: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    }, {
        tableName: 'stock_lote_org',
        schema: 'cacao',
        timestamps: false
    });

    StockLoteOrg.associate = (models) => {
        StockLoteOrg.belongsTo(models.CompraInterna, { foreignKey: 'id_compra_interna' });
        StockLoteOrg.hasMany(models.ControlLoteOrg, { foreignKey: 'id_stock_lote_org' });
        StockLoteOrg.hasMany(models.ControlLoteCv, { foreignKey: 'id_stock_lote_org' });
    };

    return StockLoteOrg;
};
