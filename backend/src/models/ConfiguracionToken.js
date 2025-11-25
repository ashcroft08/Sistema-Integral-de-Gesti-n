import { optional } from "zod";

export default (sequelize, DataTypes) => {
    const ConfiguracionToken = sequelize.define('ConfiguracionToken', {
        id_token: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tiempo_expiracion: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: 'configuracion_token',
        schema: 'seguridad',
        timestamps: false
    });

    // Hook para insertar tiempo inicial de expiración del token
    ConfiguracionToken.afterSync(async (options) => {
        try {
            // Verificar si ya existe un registro en la tabla
            const count = await ConfiguracionToken.count();
            if (count === 0) {
                // Insertar un valor inicial
                await ConfiguracionToken.create({ tiempo_expiracion: '2h' });
                console.log('✅ Configuración de token inicial creada.');
            }
        } catch (error) {
            console.error('Error al insertar el valor inicial:', error)
        }
    })

    return ConfiguracionToken;
};