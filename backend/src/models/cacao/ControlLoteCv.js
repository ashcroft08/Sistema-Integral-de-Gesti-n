export default (sequelize, DataTypes) => {
    const ControlLoteCv = sequelize.define('ControlLoteCv', {
        id_control_lote_cv: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_ruta_compra: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_lote_cv: {
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
        tableName: 'control_lote_cv',
        schema: 'cacao',
        timestamps: false
    });

    ControlLoteCv.associate = (models) => {
        ControlLoteCv.belongsTo(models.RutaCompra, { foreignKey: 'id_ruta_compra' });
        ControlLoteCv.belongsTo(models.LoteCv, { foreignKey: 'id_lote_cv' });
        ControlLoteCv.belongsTo(models.StockLoteOrg, { foreignKey: 'id_stock_lote_org' });
        ControlLoteCv.hasMany(models.LoteComercializacionCv, { foreignKey: 'id_control_lote_cv' });
    };

    return ControlLoteCv;
};
