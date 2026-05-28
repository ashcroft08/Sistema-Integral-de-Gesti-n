export default (sequelize, DataTypes) => {
    const ControlLoteOrg = sequelize.define('ControlLoteOrg', {
        id_control_lote_org: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_lote_org: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_ruta_compra: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_stock_lote_org: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        cantidad_libra: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        costo: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        es_seco: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'control_lote_org',
        schema: 'cacao',
        timestamps: false
    });

    ControlLoteOrg.associate = (models) => {
        ControlLoteOrg.belongsTo(models.LoteOrg, { foreignKey: 'id_lote_org' });
        ControlLoteOrg.belongsTo(models.RutaCompra, { foreignKey: 'id_ruta_compra' });
        ControlLoteOrg.belongsTo(models.StockLoteOrg, { foreignKey: 'id_stock_lote_org' });
        ControlLoteOrg.hasMany(models.LoteComercializacionOrg, { foreignKey: 'id_control_lote_org' });
    };

    return ControlLoteOrg;
};
