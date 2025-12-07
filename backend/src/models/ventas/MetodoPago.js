export default (sequelize, DataTypes) => {
    const MetodoPago = sequelize.define('MetodoPago', {
        id_metodo_pago: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        metodo_pago: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        codigo_sri: {  // Código según tabla del SRI
            type: DataTypes.STRING(2),
            allowNull: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'metodo_pago',
        schema: 'catalogo',
        timestamps: false
    });

    MetodoPago.associate = (models) => {
        MetodoPago.hasMany(models.Factura, { foreignKey: 'id_metodo_pago' });
    };

    // ✅ Seed con códigos oficiales del SRI
    MetodoPago.afterSync(async () => {
        try {
            const metodos = [
                { codigo: 'EFECTIVO', metodo_pago: 'Efectivo', codigo_sri: '01', activo: true },
                { codigo: 'TRANSFERENCIA', metodo_pago: 'Transferencia Bancaria', codigo_sri: '17', activo: true },
                { codigo: 'TARJETA_DEBITO', metodo_pago: 'Tarjeta de Débito', codigo_sri: '16', activo: true },
                { codigo: 'TARJETA_CREDITO', metodo_pago: 'Tarjeta de Crédito', codigo_sri: '19', activo: true },
                { codigo: 'OTROS', metodo_pago: 'Otros con utilización del sistema financiero', codigo_sri: '20', activo: true }
            ];

            for (const metodo of metodos) {
                await MetodoPago.findOrCreate({
                    where: { codigo: metodo.codigo },
                    defaults: metodo
                });
            }
            console.log('✅ Métodos de Pago verificados');
        } catch (error) {
            console.error('Error en afterSync de MetodoPago:', error);
        }
    });

    return MetodoPago;
};