export default (sequelize, DataTypes) => {
    const NotificacionesStock = sequelize.define('NotificacionesStock', {
        id_notificacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mensaje: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        leido: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fecha_creacion: {
            type: DataTypes.DATE, // Importante: DATE para tener hora exacta
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'notificaciones_stock',
        schema: 'inventario', // O 'catalogo', donde prefieras
        timestamps: false
    });

    NotificacionesStock.associate = (models) => {
        NotificacionesStock.belongsTo(models.Producto, { foreignKey: 'id_producto' });
    };

    return NotificacionesStock;
};