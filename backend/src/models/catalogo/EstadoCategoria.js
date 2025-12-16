export default (sequelize, DataTypes) => {
    const EstadoCategoria = sequelize.define('EstadoCategoria', {
        id_estado_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_categoria: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        // ✨ NUEVO CAMPO
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'estado_categoria',
        schema: 'catalogo',
        timestamps: false
    });

    EstadoCategoria.associate = (models) => {
        EstadoCategoria.hasMany(models.CategoriaProducto, { foreignKey: 'id_estado_categoria' });
    };

    return EstadoCategoria;
};