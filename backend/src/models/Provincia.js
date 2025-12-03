// models/provincia.js
export default (sequelize, DataTypes) => {
    const Provincia = sequelize.define('Provincia', {
        id_provincia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        provincia: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(10),
            allowNull: true
        }
    }, {
        tableName: 'provincia',
        schema: 'catalogo',
        timestamps: false
    });

    Provincia.associate = (models) => {
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Provincia.hasMany(models.Canton, { foreignKey: 'id_provincia', as: 'cantones' });
    };

    return Provincia;
};