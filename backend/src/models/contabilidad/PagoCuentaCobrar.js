export default (sequelize, DataTypes) => {
    const PagoCuentaCobrar = sequelize.define('PagoCuentaCobrar', {
        id_pago: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_cuenta_cobrar: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_metodo_pago: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Método de pago usado en este abono (referencia a tu tabla existente)'
        },
        id_usuario_registro: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Usuario que registró el pago'
        },
        monto_pago: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Monto del abono realizado'
        },
        fecha_pago: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        referencia_pago: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Número de voucher, cheque, etc.'
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'pago_cuenta_cobrar',
        schema: 'contabilidad',
        timestamps: true,
        createdAt: 'fecha_registro',
        updatedAt: false
    });

    PagoCuentaCobrar.associate = (models) => {
        PagoCuentaCobrar.belongsTo(models.CuentaPorCobrar, { foreignKey: 'id_cuenta_cobrar' });
        PagoCuentaCobrar.belongsTo(models.MetodoPago, { foreignKey: 'id_metodo_pago' }); // ✅ USA TU MODELO EXISTENTE
        PagoCuentaCobrar.belongsTo(models.Usuario, { foreignKey: 'id_usuario_registro' });
    };

    return PagoCuentaCobrar;
};