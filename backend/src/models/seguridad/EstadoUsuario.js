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

    return EstadoUsuario;
};