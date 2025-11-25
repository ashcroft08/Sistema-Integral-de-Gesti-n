export default (sequelize, DataTypes) => {
    const EstadoUsuario = sequelize.define('EstadoUsuario', {
        id_estado_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_usuario: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        // ✨ NUEVO CAMPO
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'estado_usuario',
        schema: 'seguridad',
        timestamps: false
    });

    EstadoUsuario.associate = (models) => {
        EstadoUsuario.hasMany(models.Usuario, { foreignKey: 'id_estado_usuario' });
    };

    EstadoUsuario.afterSync(async (options) => {
        try {
            // ✨ DEFINICIÓN CON CÓDIGOS
            const estados = [
                { nombre: 'Activo', codigo: 'ESTADO_ACTIVO' },
                { nombre: 'Inactivo', codigo: 'ESTADO_INACTIVO' },
                { nombre: 'Bloqueado', codigo: 'ESTADO_BLOQUEADO' },
            ];

            for (const e of estados) {
                await EstadoUsuario.findOrCreate({
                    where: { codigo: e.codigo },
                    defaults: { estado_usuario: e.nombre, codigo: e.codigo }
                });
            }
            console.log('✅ Estados de usuario verificados correctamente');
        } catch (error) {
            console.error('Error en afterSync de EstadoUsuario:', error);
        }
    });

    return EstadoUsuario;
};