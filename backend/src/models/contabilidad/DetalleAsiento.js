export default (sequelize, DataTypes) => {
    const DetalleAsiento = sequelize.define('DetalleAsiento', {
        id_detalle_asiento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_asiento_contable: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_plan_cuenta: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        debe: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },
        haber: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'detalle_asiento',
        schema: 'contabilidad',
        timestamps: false
    });

    DetalleAsiento.associate = (models) => {
        DetalleAsiento.belongsTo(models.AsientoContable, { foreignKey: 'id_asiento_contable' });
        DetalleAsiento.belongsTo(models.PlanCuenta, { foreignKey: 'id_plan_cuenta' });
    };

    return DetalleAsiento;
};