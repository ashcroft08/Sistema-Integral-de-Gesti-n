export default (sequelize, DataTypes) => {
    const EstadoProducto = sequelize.define('EstadoProducto', {
        id_estado_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_producto: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'estado_producto',
        schema: 'catalogo',
        timestamps: false
    });

    EstadoProducto.associate = (models) => {
        EstadoProducto.hasMany(models.Producto, { foreignKey: 'id_estado_producto' });
    };

    return EstadoProducto;
};