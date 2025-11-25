import bcrypt from 'bcryptjs'; // Asegúrate de importar esto o usar require si no usas ES modules puros

export default (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_estado_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // ⚠️ IMPORTANTE: Quitamos cualquier defaultValue numérico aquí
            // Lo manejaremos en la lógica de negocio o hooks de creación
        },
        nombre: { 
            type: DataTypes.STRING(255), 
            allowNull: false 
        },
        apellido: { 
            type: DataTypes.STRING(255), 
            allowNull: false 
        },
        email: { 
            type: DataTypes.STRING(255), 
            allowNull: false, 
            unique: true },
        password: { 
            type: DataTypes.STRING(255), 
            allowNull: false },
        primer_ingreso: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: true 
        },
        intentos_fallidos: { 
            type: DataTypes.SMALLINT, 
            defaultValue: 0 
        },
        tiempo_bloqueo: { 
            type: DataTypes.DATE, 
            allowNull: true 
        }
    }, {
        tableName: 'usuario',
        schema: 'seguridad',
        timestamps: false
    });

    Usuario.associate = (models) => {
        Usuario.belongsTo(models.Rol, { foreignKey: 'id_rol' });
        Usuario.belongsTo(models.EstadoUsuario, { foreignKey: 'id_estado_usuario' });
    };

    Usuario.afterSync(async (options) => {
        try {
            const models = sequelize.models;

            // 1. ✨ Buscamos el Rol y el Estado por CÓDIGO (Seguro y Escalable)
            const rolSuper = await models.Rol.findOne({ where: { codigo: 'ROL_SUPER' } });
            const estadoActivo = await models.EstadoUsuario.findOne({ where: { codigo: 'ESTADO_ACTIVO' } });

            // Solo procedemos si ambos existen (integridad de datos)
            if (rolSuper && estadoActivo) {
                const existingUser = await Usuario.findOne({
                    where: { email: 'admin@gmail.com' } // Mejor buscar por email único que por rol
                });

                if (!existingUser) {
                    // Importación dinámica de bcrypt si es necesario, o usar el import de arriba
                    // const bcrypt = await import('bcryptjs'); 

                    await Usuario.create({
                        id_rol: rolSuper.id_rol,
                        id_estado_usuario: estadoActivo.id_estado_usuario, // ✨ Usamos el ID real recuperado
                        nombre: 'Administrador',
                        apellido: 'Sistema',
                        email: 'admin@gmail.com',
                        password: await bcrypt.hash('Admin08_*', 10),
                    });
                    console.log('✅ Superusuario creado correctamente.');
                }
            } else {
                console.warn('⚠️ No se pudo crear Superusuario: Falta Rol o Estado inicial.');
            }
        } catch (error) {
            console.error('Error en afterSync hook de Usuario:', error);
        }
    });

    return Usuario;
};