export default (sequelize, DataTypes) => {
    const Cliente = sequelize.define('Cliente', {
        id_cliente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        es_empresa: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        celular: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        id_parroquia: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_estado_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'cliente',
        schema: 'ventas',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    Cliente.associate = (models) => {
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Cliente.belongsTo(models.Parroquia, { foreignKey: 'id_parroquia', as: 'parroquia' });
        Cliente.hasMany(models.Factura, { foreignKey: 'id_cliente' });
        Cliente.belongsTo(models.EstadoCliente, { foreignKey: 'id_estado_cliente', as: 'estado_cliente' });
        Cliente.hasMany(models.ClienteIdentificacion, { foreignKey: 'id_cliente' });
    };

    // Hook para inicializar datos (Seed)
    Cliente.afterSync(async (options) => {
        try {
            console.log('🔍 Iniciando seed del Consumidor Final...');

            // 1. Obtener IDs necesarias
            const TipoIdentificacion = sequelize.models.TipoIdentificacion;
            const tipoCF = await TipoIdentificacion.findOne({ where: { codigo: 'SRI_CONSUMIDOR_FINAL' } });
            if (!tipoCF) throw new Error('No se encontró tipo "Consumidor Final"');

            const Parroquia = sequelize.models.Parroquia;
            const parroquia = await Parroquia.findOne({ where: { codigo: '170150' } });
            if (!parroquia) throw new Error('No se encontró parroquia 170150');

            const EstadoCliente = sequelize.models.EstadoCliente;
            const estadoActivo = await EstadoCliente.findOne({ where: { codigo: 'CLIENTE_ACTIVO' } });
            if (!estadoActivo) throw new Error('No se encontró estado "CLIENTE_ACTIVO"');

            // 2. Buscar o crear el CLIENTE (sin identificación)
            let clienteCF = await Cliente.findOne({
                where: {
                    nombre: 'CONSUMIDOR FINAL',
                    apellido: 'FINAL'
                }
            });

            if (!clienteCF) {
                clienteCF = await Cliente.create({
                    nombre: 'CONSUMIDOR FINAL',
                    apellido: 'FINAL',
                    es_empresa: false,
                    celular: 'N/A',
                    email: 'N/A',
                    direccion: 'N/A',
                    id_parroquia: parroquia.id_parroquia,
                    id_estado_cliente: estadoActivo.id_estado_cliente
                });
                console.log(`✅ Cliente Consumidor Final creado con ID: ${clienteCF.id_cliente}`);
            }

            // 3. Crear su identificación (si no existe)
            const ClienteIdentificacion = sequelize.models.ClienteIdentificacion;
            const identificacionExistente = await ClienteIdentificacion.findOne({
                where: {
                    id_cliente: clienteCF.id_cliente,
                    id_tipo_identificacion: tipoCF.id_tipo_identificacion
                }
            });

            if (!identificacionExistente) {
                await ClienteIdentificacion.create({
                    id_cliente: clienteCF.id_cliente,
                    id_tipo_identificacion: tipoCF.id_tipo_identificacion,
                    identificacion: 'CF',
                    es_principal: true
                });
                console.log(`✅ Identificación 'CF' asignada al cliente.`);
            }

        } catch (error) {
            console.error('❌ Error en seed del Consumidor Final:', error);
        }
    });

    return Cliente;
};