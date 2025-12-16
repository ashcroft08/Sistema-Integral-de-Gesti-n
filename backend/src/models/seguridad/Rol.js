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

    return Rol;
};