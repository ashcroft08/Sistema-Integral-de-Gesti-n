export default (sequelize, DataTypes) => {
    const ComunidadMp = sequelize.define('ComunidadMp', {
        id_comunidad_mp: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        comunidad: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'comunidad_mp',
        schema: 'cacao',
        timestamps: false
    });

    ComunidadMp.associate = (models) => {
        ComunidadMp.hasMany(models.CompraInterna, { foreignKey: 'id_comunidad_mp' });
    };

    return ComunidadMp;
};
