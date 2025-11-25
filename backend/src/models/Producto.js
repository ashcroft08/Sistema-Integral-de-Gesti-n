export default (sequelize, DataTypes) => {
    const Producto = sequelize.define('Producto', {
        id_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_categoria: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_estado_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        codigo_producto: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock_actual: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stock_minimo: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'producto',
        schema: 'ventas',
        timestamps: false
    });

    Producto.associate = (models) => {
        Producto.belongsTo(models.CategoriaProducto, { foreignKey: 'id_categoria' });
        Producto.belongsTo(models.EstadoProducto, { foreignKey: 'id_estado_producto' });
        Producto.hasMany(models.DetalleFactura, { foreignKey: 'id_producto' });
        Producto.hasMany(models.MovimientoInventario, { foreignKey: 'id_producto' });
    };

    return Producto;
};