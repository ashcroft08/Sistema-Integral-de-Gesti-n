export default (sequelize, DataTypes) => {
    const CategoriaProducto = sequelize.define('CategoriaProducto', {
        id_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        categoria: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        id_estado_categoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'categoria',
        schema: 'inventario',
        timestamps: false
    });

    CategoriaProducto.associate = (models) => {
        CategoriaProducto.hasMany(models.Producto, { foreignKey: 'id_categoria' });
        CategoriaProducto.belongsTo(models.EstadoCategoria, {
            foreignKey: 'id_estado_categoria',
            as: 'EstadoCategoria' // <--- Esto evita que lo llame "Categorium"
        });
    };

    return CategoriaProducto;
};