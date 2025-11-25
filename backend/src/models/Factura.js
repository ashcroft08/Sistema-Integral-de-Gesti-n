export default (sequelize, DataTypes) => {
    const Factura = sequelize.define('Factura', {
        id_factura: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_vendedor: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_estado_sri: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        secuencial: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        clave_acceso_sri: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        fecha_emision: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        xml_autorizacion_sri: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        total_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        subtotal_sin_iva: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        subtotal_con_iva: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'factura',
        schema: 'ventas',
        timestamps: false
    });

    Factura.associate = (models) => {
        Factura.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
        Factura.belongsTo(models.Usuario, { foreignKey: 'id_vendedor' });
        Factura.belongsTo(models.EstadoSri, { foreignKey: 'id_estado_sri' });
        Factura.belongsTo(models.ValorIva, { foreignKey: 'id_valor_iva' });
        Factura.hasMany(models.DetalleFactura, { foreignKey: 'id_factura' });
    };

    return Factura;
};