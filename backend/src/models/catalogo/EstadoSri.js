export default (sequelize, DataTypes) => {
    const EstadoSri = sequelize.define('EstadoSri', {
        id_estado_sri: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_sri: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        descripcion: {  // ✅ NUEVO: Descripción detallada
            type: DataTypes.TEXT,
            allowNull: true
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