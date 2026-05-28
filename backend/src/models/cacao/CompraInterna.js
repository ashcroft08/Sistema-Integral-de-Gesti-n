export default (sequelize, DataTypes) => {
    const CompraInterna = sequelize.define('CompraInterna', {
        id_compra_interna: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_comunidad_mp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_proveedor_mp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_categoria_mp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_producto_mp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_negociador_mp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha_compra: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        cantidad_libra: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        costo_unitario: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(12, 4),
            allowNull: false
        }
    }, {
        tableName: 'compra_interna',
        schema: 'cacao',
        timestamps: false
    });

    CompraInterna.associate = (models) => {
        CompraInterna.belongsTo(models.ComunidadMp, { foreignKey: 'id_comunidad_mp' });
        CompraInterna.belongsTo(models.ProveedorMp, { foreignKey: 'id_proveedor_mp' });
        CompraInterna.belongsTo(models.CategoriaMp, { foreignKey: 'id_categoria_mp' });
        CompraInterna.belongsTo(models.ProductoMp, { foreignKey: 'id_producto_mp' });
        CompraInterna.belongsTo(models.NegociadorMp, { foreignKey: 'id_negociador_mp' });
        CompraInterna.hasMany(models.StockLoteOrg, { foreignKey: 'id_compra_interna' });
    };

    return CompraInterna;
};
