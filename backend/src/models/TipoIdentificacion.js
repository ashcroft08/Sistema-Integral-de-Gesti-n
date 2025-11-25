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
        TipoIdentificacion.hasMany(models.Cliente, { foreignKey: 'id_tipo_identificacion' });
    };

    // Hook para insertar tipos de identificación iniciales
    TipoIdentificacion.afterSync(async (options) => {
        try {
            const tiposIdentificacion = [
                {
                    tipo_identificacion: 'RUC',
                    descripcion: 'Registro Único de Contribuyentes para personas jurídicas y naturales con negocio'
                },
                {
                    tipo_identificacion: 'Cédula',
                    descripcion: 'Cédula de identidad para personas naturales'
                },
                {
                    tipo_identificacion: 'Pasaporte',
                    descripcion: 'Documento de identificación para extranjeros'
                },
                {
                    tipo_identificacion: 'Consumidor Final',
                    descripcion: 'Para ventas a consumidores finales que no requieren factura con identificación'
                }
            ];

            for (const tipo of tiposIdentificacion) {
                await TipoIdentificacion.findOrCreate({
                    where: { tipo_identificacion: tipo.tipo_identificacion },
                    defaults: tipo
                });
            }

            console.log('✅ Tipos de identificación iniciales verificados/creados correctamente');
        } catch (error) {
            console.error('Error en afterSync hook de TipoIdentificacion:', error);
        }
    });

    return TipoIdentificacion;
};