export default (sequelize, DataTypes) => {
    const PlanCuenta = sequelize.define('PlanCuenta', {
        id_cuenta: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo_cuenta: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        nombre_cuenta: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        tipo_cuenta: {
            type: DataTypes.STRING(20),
            allowNull: false // 'activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto'
        },
        id_cuenta_padre: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        nivel: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        permitir_movimientos: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        activa: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'plan_cuenta',
        schema: 'contabilidad',
        timestamps: false
    });

    PlanCuenta.associate = (models) => {
        PlanCuenta.hasMany(models.DetalleAsiento, { foreignKey: 'id_plan_cuenta' });
        PlanCuenta.hasMany(models.PlanCuenta, { foreignKey: 'id_cuenta_padre' });
    };

    return PlanCuenta;
};