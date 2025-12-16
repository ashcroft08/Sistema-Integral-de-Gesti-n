export default (sequelize, DataTypes) => {
    const EstadoCliente = sequelize.define('EstadoCliente', {
        id_estado_cliente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true, // Código inmutable para referencias seguras (ej: CLIENTE_ACTIVO)
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false, // Nombre legible del estado
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'estado_cliente',
        schema: 'catalogo',
        timestamps: false
    });

    // Relación: un estado puede tener muchos clientes
    EstadoCliente.associate = (models) => {
        EstadoCliente.hasMany(models.Cliente, { foreignKey: 'id_estado_cliente' });
    };

    // Seed automático con afterSync
    EstadoCliente.afterSync(async (options) => {
        try {
            const estados = [
                {
                    codigo: 'CLIENTE_ACTIVO',
                    nombre: 'Activo',
                    descripcion: 'Cliente activo y operativo'
                },
                {
                    codigo: 'CLIENTE_INACTIVO',
                    nombre: 'Inactivo',
                    descripcion: 'Cliente temporalmente inactivo (ej: moroso)'
                }
            ];

            for (const estado of estados) {
                await EstadoCliente.findOrCreate({
                    where: { codigo: estado.codigo },
                    defaults: estado
                });
            }
            console.log('✅ Estados de cliente verificados en catálogo');
        } catch (error) {
            console.error('❌ Error en afterSync de EstadoCliente:', error);
        }
    });

    return EstadoCliente;
};