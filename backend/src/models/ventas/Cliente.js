// models/cliente.js
export default (sequelize, DataTypes) => {
    const Cliente = sequelize.define('Cliente', {
        id_cliente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_tipo_identificacion: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_parroquia: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        identificacion: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        celular: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'cliente',
        schema: 'ventas',
        timestamps: false
    });

    Cliente.associate = (models) => {
        Cliente.belongsTo(models.TipoIdentificacion, { foreignKey: 'id_tipo_identificacion' });
        // Usar 'as' aquí define cómo se llamará la relación en el JSON
        Cliente.belongsTo(models.Parroquia, { foreignKey: 'id_parroquia', as: 'parroquia' });
        Cliente.hasMany(models.Factura, { foreignKey: 'id_cliente' });
    };

    // Hook para inicializar datos (Seed)
    Cliente.afterSync(async (options) => {
        try {
            console.log('🔍 Iniciando seed del Consumidor Final...');

            // 1. Obtener la ID del Tipo de Identificación para "Consumidor Final"
            const TipoIdentificacion = sequelize.models.TipoIdentificacion; // Accede al modelo desde sequelize
            const tipoIdentificacionCF = await TipoIdentificacion.findOne({
                where: {
                    codigo: 'SRI_CONSUMIDOR_FINAL' // Usamos el código definido en el modelo TipoIdentificacion
                }
            });

            if (!tipoIdentificacionCF) {
                throw new Error('No se encontró el Tipo de Identificación con código SRI_CONSUMIDOR_FINAL. Asegúrate de que el modelo TipoIdentificacion y su hook afterSync se hayan ejecutado correctamente.');
            }
            const idTipoIdentificacionCF = tipoIdentificacionCF.id_tipo_identificacion;
            console.log(`✅ Tipo de identificación 'Consumidor Final' encontrado: ID ${idTipoIdentificacionCF}`);

            // 2. Obtener la ID de una Parroquia (ej: San Francisco de Quito)
            const Parroquia = sequelize.models.Parroquia; // Accede al modelo desde sequelize
            const parroquiaDefault = await Parroquia.findOne({
                where: {
                    codigo: '170150' // Código INEC de San Francisco de Quito
                }
            });

            if (!parroquiaDefault) {
                throw new Error('No se encontró la Parroquia con código 170150 (San Francisco de Quito). Asegúrate de que los datos DPA estén cargados.');
            }
            const idParroquiaDefault = parroquiaDefault.id_parroquia;
            console.log(`✅ Parroquia 'San Francisco de Quito' encontrada: ID ${idParroquiaDefault}`);

            // 3. Datos del Consumidor Final
            const consumidorFinal = {
                id_tipo_identificacion: idTipoIdentificacionCF,
                id_parroquia: idParroquiaDefault,
                identificacion: 'CF', // Identificación estándar
                nombre: 'CONSUMIDOR FINAL',
                apellido: 'FINAL',
                celular: 'N/A',
                email: 'N/A',
                direccion: 'N/A'
            };

            // 4. Buscar si ya existe el cliente CF
            const clienteExistente = await Cliente.findOne({
                where: {
                    identificacion: 'CF'
                }
            });

            if (clienteExistente) {
                console.log(`⚠️  El cliente Consumidor Final (ID: ${clienteExistente.id_cliente}) ya existe.`);
                // Opcional: Verificar si los datos son correctos y actualizar si es necesario
                // await clienteExistente.update({...});
            } else {
                // 5. Crear el cliente si no existe
                await Cliente.create(consumidorFinal);
                console.log(`✅ Cliente Consumidor Final creado exitosamente.`);
            }

        } catch (error) {
            console.error('❌ Error en el hook afterSync de Cliente (seed Consumidor Final):', error);
            // Opcional: Lanzar el error para detener la sincronización si es crítico
            // throw error;
        }
    });

    return Cliente;
};