export default (sequelize, DataTypes) => {
    const ValorIva = sequelize.define('ValorIva', {
        id_iva: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        porcentaje_iva: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'valor_iva',
        schema: 'catalogo',
        timestamps: false
    });

    ValorIva.associate = (models) => {
        ValorIva.hasMany(models.Factura, { foreignKey: 'id_valor_iva' });
        ValorIva.hasMany(models.DetalleFactura, { foreignKey: 'id_valor_iva' });
    };

    ValorIva.afterSync(async () => {
        try {
            const ivas = [
                { codigo: '0', porcentaje: 0, descripcion: 'IVA 0%' },
                { codigo: '2', porcentaje: 12, descripcion: 'IVA 12%' },
                { codigo: '3', porcentaje: 14, descripcion: 'IVA 14%' },
                { codigo: '4', porcentaje: 15, descripcion: 'IVA 15%' }, // El actual
                { codigo: '5', porcentaje: 5, descripcion: 'IVA 5% (Materiales Construcción)' }
            ];

            for (const iva of ivas) {
                await ValorIva.findOrCreate({
                    where: { codigo: iva.codigo },
                    defaults: {
                        codigo: iva.codigo,
                        porcentaje_iva: iva.porcentaje,
                        descripcion: iva.descripcion
                    }
                });
            }
            console.log('✅ Valores de IVA verificados');
        } catch (error) {
            console.error('Error en afterSync de ValorIva:', error);
        }
    });

    return ValorIva;
};