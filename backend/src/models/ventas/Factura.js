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
        id_valor_iva: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'IVA principal de la factura'
        },
        id_metodo_pago: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Método de pago según catálogo (efectivo, tarjeta, etc.)'
        },
        tipo_venta: {
            type: DataTypes.ENUM('CONTADO', 'CREDITO'),
            allowNull: false,
            defaultValue: 'CONTADO',
            comment: 'CONTADO = pago inmediato, CREDITO = cuentas por cobrar'
        },
        // Campos para ventas a crédito
        plazo_credito_dias: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Días de plazo para pago (solo si tipo_venta=CREDITO)'
        },
        fecha_vencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Fecha límite de pago (solo si tipo_venta=CREDITO)'
        },
        saldo_pendiente: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00,
            comment: 'Saldo por cobrar (solo si tipo_venta=CREDITO)'
        },
        referencia_pago: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Número de voucher, cheque, transferencia, etc.'
        },
        secuencial: {
            type: DataTypes.STRING(17),
            allowNull: false,
            unique: true,
            comment: 'Formato: 001-001-000000001'
        },
        clave_acceso_sri: {
            type: DataTypes.STRING(49),
            allowNull: true,
            unique: true
        },
        numero_autorizacion: {
            type: DataTypes.STRING(49),
            allowNull: true
        },
        fecha_emision: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        fecha_autorizacion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        subtotal_sin_iva: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        subtotal_con_iva: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total_iva: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        xml_firmado_url: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'URL del XML en Cloudinary'
        },
        xml_respuesta_sri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        mensaje_sri: {
            type: DataTypes.TEXT,
            allowNull: true
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
        Factura.belongsTo(models.MetodoPago, { foreignKey: 'id_metodo_pago' }); // ✅ USA TU MODELO EXISTENTE
        Factura.hasMany(models.DetalleFactura, {
            foreignKey: 'id_factura',
            as: 'DetalleFactura'  // ← Forzar nombre singular
        });
        Factura.hasMany(models.CuentaPorCobrar, { foreignKey: 'id_factura' });
    };

    return Factura;
};