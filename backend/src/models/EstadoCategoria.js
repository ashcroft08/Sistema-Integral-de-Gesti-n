export default (sequelize, DataTypes) => {
    const EstadoCategoria = sequelize.define('EstadoCategoria', {
        id_estado_categoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        estado_categoria: {
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
        tableName: 'estado_categoria',
        schema: 'catalogo',
        timestamps: false
    });

    EstadoCategoria.associate = (models) => {
        EstadoCategoria.hasMany(models.CategoriaProducto, { foreignKey: 'id_estado_categoria' });
    };

    EstadoCategoria.afterSync(async (options) => {
        try {
            // ✨ DEFINICIÓN CON CÓDIGOS
            const estados = [
                { nombre: 'Activo', codigo: 'CAT_ACTIVA' },
                { nombre: 'Inactivo', codigo: 'CAT_INACTIVA' },
            ];

            for (const e of estados) {
                await EstadoCategoria.findOrCreate({
                    where: { codigo: e.codigo },
                    defaults: { estado_categoria: e.nombre, codigo: e.codigo }
                });
            }
            console.log('✅ Estados de categoría verificados');
        } catch (error) {
            console.error('Error en afterSync de EstadoCategoria:', error);
        }
    });

    return EstadoCategoria;
};