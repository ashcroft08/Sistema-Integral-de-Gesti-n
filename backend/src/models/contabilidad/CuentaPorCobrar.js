export default (sequelize, DataTypes) => {
    const CuentaPorCobrar = sequelize.define('CuentaPorCobrar', {
        id_cuenta_cobrar: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_factura: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        monto_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Monto total de la deuda'
        },
        monto_pagado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            comment: 'Total pagado hasta el momento'
        },
        saldo_pendiente: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Saldo que falta por cobrar'
        },
        fecha_emision: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fecha_vencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        dias_vencidos: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: 'Días transcurridos desde vencimiento (si aplica)'
        },
        estado: {
            type: DataTypes.ENUM('PENDIENTE', 'PAGADA', 'VENCIDA', 'PARCIAL'),
            allowNull: false,
            defaultValue: 'PENDIENTE'
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'cuenta_por_cobrar',
        schema: 'contabilidad',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    CuentaPorCobrar.associate = (models) => {
        CuentaPorCobrar.belongsTo(models.Factura, { foreignKey: 'id_factura' });
        CuentaPorCobrar.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
        CuentaPorCobrar.hasMany(models.PagoCuentaCobrar, { foreignKey: 'id_cuenta_cobrar' });
    };

    return CuentaPorCobrar;
};