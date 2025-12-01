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
                { estado_sri: 'Pendiente', codigo: 'SRI_PENDIENTE' }, // Guardado localmente
                { estado_sri: 'Enviado', codigo: 'SRI_ENVIADO' },     // Enviado, esperando respuesta
                { estado_sri: 'Autorizado', codigo: 'SRI_AUTORIZADO' }, // Todo OK
                { estado_sri: 'Rechazado', codigo: 'SRI_RECHAZADO' },   // Error en datos
                { estado_sri: 'Anulado', codigo: 'SRI_ANULADO' }        // Anulado localmente
            ];

            for (const estado of estados) {
                await EstadoSri.findOrCreate({
                    where: { codigo: estado.codigo },
                    defaults: estado
                });
            }
            console.log('✅ Estados SRI verificados');
        } catch (error) {
            console.error('Error en afterSync de EstadoSri:', error);
        }
    });

    return EstadoSri;
};