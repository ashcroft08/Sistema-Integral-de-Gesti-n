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

    return EstadoCliente;
};