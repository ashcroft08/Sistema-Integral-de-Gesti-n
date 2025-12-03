// models/canton.js
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
        codigo: {
            type: DataTypes.STRING(10),
            allowNull: true
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
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Canton.belongsTo(models.Provincia, { foreignKey: 'id_provincia', as: 'provincia' });
        Canton.hasMany(models.Parroquia, { foreignKey: 'id_canton', as: 'parroquias' });
    };

    return Canton;
};