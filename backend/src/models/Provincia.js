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
        }
    }, {
        tableName: 'provincia',
        schema: 'catalogo',
        timestamps: false
    });

    Provincia.associate = (models) => {
        Provincia.hasMany(models.Canton, { foreignKey: 'id_provincia' });
    };

    return Provincia;
};