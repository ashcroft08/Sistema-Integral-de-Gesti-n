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

    EstadoSri.afterSync(async () => {
        try {
            const estados = [
                {
                    codigo: 'SRI_PENDIENTE',
                    estado_sri: 'Pendiente',
                    descripcion: 'Factura guardada localmente, pendiente de firma y envío al SRI'
                },
                {
                    codigo: 'SRI_FIRMADO',
                    estado_sri: 'Firmado',
                    descripcion: 'XML firmado digitalmente, listo para enviar al SRI'
                },
                {
                    codigo: 'SRI_ENVIADO',
                    estado_sri: 'Enviado',
                    descripcion: 'Enviado al SRI, esperando respuesta'
                },
                {
                    codigo: 'SRI_RECIBIDA',
                    estado_sri: 'Recibida',
                    descripcion: 'SRI recibió el comprobante, procesando autorización'
                },
                {
                    codigo: 'SRI_AUTORIZADO',
                    estado_sri: 'Autorizado',
                    descripcion: 'Comprobante autorizado por el SRI'
                },
                {
                    codigo: 'SRI_DEVUELTA',
                    estado_sri: 'Devuelta',
                    descripcion: 'SRI devolvió el comprobante por errores corregibles'
                },
                {
                    codigo: 'SRI_RECHAZADO',
                    estado_sri: 'Rechazado',
                    descripcion: 'Comprobante rechazado por el SRI'
                },
                {
                    codigo: 'SRI_ANULADO',
                    estado_sri: 'Anulado',
                    descripcion: 'Factura anulada localmente (no enviada al SRI)'
                }
            ];

            for (const estado of estados) {
                await EstadoSri.findOrCreate({
                    where: { codigo: estado.codigo },
                    defaults: estado
                });
            }
            console.log('✅ Estados SRI actualizados');
        } catch (error) {
            console.error('Error en afterSync de EstadoSri:', error);
        }
    });

    return EstadoSri;
};