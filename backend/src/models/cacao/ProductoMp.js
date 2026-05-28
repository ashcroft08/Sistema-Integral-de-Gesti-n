export default (sequelize, DataTypes) => {
    const ProductoMp = sequelize.define('ProductoMp', {
        id_producto_mp: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        producto: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'producto_mp',
        schema: 'cacao',
        timestamps: false
    });

    ProductoMp.associate = (models) => {
        ProductoMp.hasMany(models.CompraInterna, { foreignKey: 'id_producto_mp' });
    };

    return ProductoMp;
};
