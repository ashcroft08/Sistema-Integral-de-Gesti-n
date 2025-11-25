export default (sequelize, DataTypes) => {
    const Canton = sequelize.define('Canton', {
        id_canton: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        canton: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        id_provincia: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'canton',
        schema: 'catalogo',
        timestamps: false
    });

    Canton.associate = (models) => {
        Canton.belongsTo(models.Provincia, { foreignKey: 'id_provincia' });
        Canton.hasMany(models.Cliente, { foreignKey: 'id_canton' });
    };

    return Canton;
};