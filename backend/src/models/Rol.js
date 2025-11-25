export default (sequelize, DataTypes) => {
    const Rol = sequelize.define('Rol', {
        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rol: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        // ✨ NUEVO CAMPO: Identificador semántico inmutable
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true // Garantiza que no haya duplicados (ej: ROL_ADMIN)
        }
    }, {
        tableName: 'rol',
        schema: 'seguridad',
        timestamps: false
    });

    Rol.associate = (models) => {
        Rol.hasMany(models.Usuario, { foreignKey: 'id_rol' });
    };

    Rol.afterSync(async (options) => {
        try {
            // ✨ DEFINICIÓN CON CÓDIGOS
            const roles = [
                { rol: 'Superusuario', codigo: 'ROL_SUPER' },
                { rol: 'Administrador', codigo: 'ROL_ADMIN' },
                { rol: 'Vendedor', codigo: 'ROL_VENDEDOR' },
                { rol: 'Contador', codigo: 'ROL_CONTADOR' }
            ];

            for (const r of roles) {
                // Buscamos por código, que es más seguro que el nombre
                await Rol.findOrCreate({
                    where: { codigo: r.codigo },
                    defaults: { rol: r.rol, codigo: r.codigo }
                });
            }
            console.log('✅ Roles iniciales verificados correctamente');
        } catch (error) {
            console.error('Error en afterSync de Rol:', error);
        }
    });

    return Rol;
};