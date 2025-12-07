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
            allowNull: true
        },
        id_valor_iva: {  // ✅ AGREGADO: IVA principal de la factura
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_metodo_pago: {  // ✅ NUEVO: Método de pago
            type: DataTypes.INTEGER,
            allowNull: false
        },
        secuencial: {
            type: DataTypes.STRING(17), // 001-001-000000001
            allowNull: false,
            unique: true
        },
        clave_acceso_sri: {
            type: DataTypes.STRING(49), // 49 dígitos numéricos
            allowNull: true,
            unique: true
        },
        numero_autorizacion: {  // ✅ NUEVO: Número de autorización SRI
            type: DataTypes.STRING(49),
            allowNull: true
        },
        fecha_emision: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fecha_autorizacion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        xml_firmado_url: {  // ✅ CAMBIADO: URL en Backblaze, no el XML completo
            type: DataTypes.STRING(500),
            allowNull: true
        },
        xml_respuesta_sri: {  // ✅ NUEVO: Respuesta del SRI (autorización/rechazo)
            type: DataTypes.TEXT,
            allowNull: true
        },
        mensaje_sri: {  // ✅ NUEVO: Mensaje de error/éxito del SRI
            type: DataTypes.TEXT,
            allowNull: true
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
        total_iva: {  // ✅ NUEVO: Total de IVA calculado
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'factura',
        schema: 'ventas',
        timestamps: true,  // ✅ Activar timestamps para auditoría
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    Factura.associate = (models) => {
        Factura.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
        Factura.belongsTo(models.Usuario, { foreignKey: 'id_vendedor' });
        Factura.belongsTo(models.EstadoSri, { foreignKey: 'id_estado_sri' });
        Factura.belongsTo(models.ValorIva, { foreignKey: 'id_valor_iva' });
        Factura.belongsTo(models.MetodoPago, { foreignKey: 'id_metodo_pago' });  // ✅ NUEVO
        Factura.hasMany(models.DetalleFactura, { foreignKey: 'id_factura' });
    };

    return Factura;
};