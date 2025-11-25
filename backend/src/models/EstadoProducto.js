export default (sequelize, DataTypes) => {
    const EstadoProducto = sequelize.define('EstadoProducto', {
        id_estado_producto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_producto: {
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
        tableName: 'estado_producto',
        schema: 'catalogo',
        timestamps: false
    });

    EstadoProducto.associate = (models) => {
        EstadoProducto.hasMany(models.Producto, { foreignKey: 'id_estado_producto' });
    };

    EstadoProducto.afterSync(async (options) => {
        try {
            // ✨ DEFINICIÓN CON CÓDIGOS
            const estados = [
                { nombre: 'Activo', codigo: 'PRO_ACTIVA' },
                { nombre: 'Inactivo', codigo: 'PRO_INACTIVA' },
                { nombre: 'Agotado', codigo: 'PRO_AGOTADO' },
                { nombre: 'Descontinuado', codigo: 'PRO_DESCONTINUADO' },
            ];

            for (const e of estados) {
                await EstadoProducto.findOrCreate({
                    where: { codigo: e.codigo },
                    defaults: { estado_producto: e.nombre, codigo: e.codigo }
                });
            }
            console.log('✅ Estados de producto verificados');
        } catch (error) {
            console.error('Error en afterSync de EstadoProducto:', error);
        }
    });

    return EstadoProducto;
};