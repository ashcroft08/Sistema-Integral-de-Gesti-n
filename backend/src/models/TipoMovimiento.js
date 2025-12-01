export default (sequelize, DataTypes) => {
    const TipoMovimiento = sequelize.define('TipoMovimiento', {
        id_tipo_movimiento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipo_movimiento: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'tipo_movimiento',
        schema: 'catalogo',
        timestamps: false
    });

    TipoMovimiento.associate = (models) => {
        TipoMovimiento.hasMany(models.MovimientoInventario, { foreignKey: 'id_tipo_movimiento' });
    };

    TipoMovimiento.afterSync(async () => {
        const tipos = [
            { codigo: 'MOV_INICIAL', nombre: 'Inventario Inicial', desc: 'Primer ingreso al crear el producto' },
            { codigo: 'MOV_COMPRA', nombre: 'Compra / Reabastecimiento', desc: 'Ingreso por compra a proveedor' },
            { codigo: 'MOV_VENTA', nombre: 'Venta', desc: 'Salida por venta a cliente' },
            { codigo: 'MOV_AJUSTE', nombre: 'Ajuste / Pérdida', desc: 'Corrección manual de inventario' }
        ];

        for (const t of tipos) {
            await TipoMovimiento.findOrCreate({
                where: { tipo_movimiento: t.codigo }, // Usamos el código para buscar
                defaults: {
                    tipo_movimiento: t.codigo, // Guardamos código (ej. MOV_INICIAL)
                    descripcion: t.nombre // Guardamos nombre legible
                }
            });
        }
    });

    return TipoMovimiento;
};