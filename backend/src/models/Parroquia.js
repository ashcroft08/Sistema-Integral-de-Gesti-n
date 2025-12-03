// models/parroquia.js
export default (sequelize, DataTypes) => {
    const Parroquia = sequelize.define('Parroquia', {
        id_parroquia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        parroquia: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // Guardamos el código del INEC (ej: "010150")
        codigo: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        id_canton: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'parroquia',
        schema: 'catalogo',
        timestamps: false
    });

    Parroquia.associate = (models) => {
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Parroquia.belongsTo(models.Canton, { foreignKey: 'id_canton', as: 'canton' });
        Parroquia.hasMany(models.Cliente, { foreignKey: 'id_parroquia', as: 'clientes' });
    };

    return Parroquia;
};