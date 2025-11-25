export default (sequelize, DataTypes) => {
    const EstadoSri = sequelize.define('EstadoSri', {
        id_estado_sri: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_sri: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'estado_sri',
        schema: 'catalogo',
        timestamps: false
    });

    EstadoSri.associate = (models) => {
        EstadoSri.hasMany(models.Factura, { foreignKey: 'id_estado_sri' });
    };

    return EstadoSri;
};