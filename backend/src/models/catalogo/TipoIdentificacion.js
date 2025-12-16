export default (sequelize, DataTypes) => {
    const TipoIdentificacion = sequelize.define('TipoIdentificacion', {
        id_tipo_identificacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipo_identificacion: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true // Garantiza que no se repita (ej: 'SRI_RUC')
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'tipo_identificacion',
        schema: 'catalogo',
        timestamps: false
    });

    TipoIdentificacion.associate = (models) => {
        TipoIdentificacion.hasMany(models.ClienteIdentificacion, { foreignKey: 'id_tipo_identificacion' });
    };

    return TipoIdentificacion;
};