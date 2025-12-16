export default (sequelize, DataTypes) => {
    const ConfiguracionBloqueo = sequelize.define('ConfiguracionBloqueo', {
        id_config_bloqueo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        intentos_maximos: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3 // Por defecto 3 intentos
        },
        duracion_bloqueo_minutos: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 15 // Por defecto 15 minutos
        }
    }, {
        tableName: 'configuracion_bloqueo',
        schema: 'configuracion',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    return ConfiguracionBloqueo;
};