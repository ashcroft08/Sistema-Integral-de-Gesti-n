// models/DetalleFactura.js
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
        id_descuento: {
            type: DataTypes.INTEGER,
            allowNull: true // Puede ser nulo si borras el descuento, o ponle false si siempre usas "Ninguno"
        },
        id_valor_iva: { // Corregido nombre anterior
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
        // Guardamos el porcentaje histórico por si cambian el catálogo luego
        porcentaje_descuento: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        },
        valor_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total: {
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
        DetalleFactura.belongsTo(models.Descuento, { foreignKey: 'id_descuento' });
        DetalleFactura.hasOne(models.MovimientoInventario, { foreignKey: 'id_detalle_factura' });
    };

    return DetalleFactura;
};