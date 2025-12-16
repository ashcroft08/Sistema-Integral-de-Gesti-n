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

    // Hook mejorado con Códigos
    TipoIdentificacion.afterSync(async (options) => {
        try {
            const tiposIdentificacion = [
                {
                    tipo_identificacion: 'RUC',
                    codigo: 'SRI_RUC', // Código fijo
                    descripcion: 'Registro Único de Contribuyentes'
                },
                {
                    tipo_identificacion: 'Cédula',
                    codigo: 'SRI_CEDULA',
                    descripcion: 'Cédula de identidad'
                },
                {
                    tipo_identificacion: 'Pasaporte',
                    codigo: 'SRI_PASAPORTE',
                    descripcion: 'Documento para extranjeros'
                },
                {
                    tipo_identificacion: 'Consumidor Final',
                    codigo: 'SRI_CONSUMIDOR_FINAL',
                    descripcion: 'Ventas menores'
                }
            ];

            for (const tipo of tiposIdentificacion) {
                // Buscamos por CÓDIGO, no por nombre
                await TipoIdentificacion.findOrCreate({
                    where: { codigo: tipo.codigo },
                    defaults: tipo
                });
            }
            console.log('✅ Tipos de identificación verificados');
        } catch (error) {
            console.error('Error en afterSync de TipoIdentificacion:', error);
        }
    });

    return TipoIdentificacion;
};