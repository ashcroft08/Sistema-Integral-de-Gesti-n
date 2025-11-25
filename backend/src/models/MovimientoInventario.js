export default (sequelize, DataTypes) => {
    const MovimientoInventario = sequelize.define('MovimientoInventario', {
        id_movimiento_inventario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_tipo_movimiento: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha_movimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        stock_anterior: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stock_nuevo: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'movimiento_inventario',
        schema: 'ventas',
        timestamps: false
    });

    MovimientoInventario.associate = (models) => {
        MovimientoInventario.belongsTo(models.Producto, { foreignKey: 'id_producto' });
        MovimientoInventario.belongsTo(models.TipoMovimiento, { foreignKey: 'id_tipo_movimiento' });
    };

    return MovimientoInventario;
};