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

    return Usuario;
};