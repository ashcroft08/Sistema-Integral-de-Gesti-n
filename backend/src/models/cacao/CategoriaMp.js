export default (sequelize, DataTypes) => {
    const CategoriaMp = sequelize.define('CategoriaMp', {
        id_categoria_mp: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        categoria: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'categoria_mp',
        schema: 'cacao',
        timestamps: false
    });

    CategoriaMp.associate = (models) => {
        CategoriaMp.hasMany(models.CompraInterna, { foreignKey: 'id_categoria_mp' });
    };

    return CategoriaMp;
};
