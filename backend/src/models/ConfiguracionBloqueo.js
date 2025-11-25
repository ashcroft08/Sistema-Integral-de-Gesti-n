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
        schema: 'seguridad',
        timestamps: false
    });

    // Hook para insertar valores por defecto
    ConfiguracionBloqueo.afterSync(async (options) => {
        try {
            const config = await ConfiguracionBloqueo.findByPk(1);
            if (!config) {
                await ConfiguracionBloqueo.create({
                    id_config_bloqueo: 1,
                    intentos_maximos: 3,
                    duracion_bloqueo_minutos: 15
                });
                console.log('✅ Configuración de bloqueo inicial creada.');
            }
        } catch (error) {
            console.error('Error en afterSync hook de ConfiguracionBloqueo:', error);
        }
    });

    return ConfiguracionBloqueo;
};