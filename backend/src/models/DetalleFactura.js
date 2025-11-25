export default (sequelize, DataTypes) => {
    const DetalleFactura = sequelize.define('DetalleFactura', {
        id_detalle_factura: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_factura: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_valor_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        porcentaje_descuento: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        valor_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'detalle_factura',
        schema: 'ventas',
        timestamps: false
    });

    DetalleFactura.associate = (models) => {
        DetalleFactura.belongsTo(models.Factura, { foreignKey: 'id_factura' });
        DetalleFactura.belongsTo(models.Producto, { foreignKey: 'id_producto' });
        DetalleFactura.belongsTo(models.ValorIva, { foreignKey: 'id_valor_iva' });
        DetalleFactura.hasOne(models.MovimientoInventario, { foreignKey: 'id_detalle_factura' });
    };

    return DetalleFactura;
};