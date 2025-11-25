export default (sequelize, DataTypes) => {
    const ValorIva = sequelize.define('ValorIva', {
        id_iva: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        porcentaje_iva: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        valor_iva: {
            type: DataTypes.DECIMAL(5, 2),
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

    return ValorIva;
};