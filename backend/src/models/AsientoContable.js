export default (sequelize, DataTypes) => {
    const AsientoContable = sequelize.define('AsientoContable', {
        id_asiento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha_asiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        glosa: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tipo_asiento: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        id_factura: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_contador: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        estado: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        total_debe: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total_haber: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'asiento_contable',
        schema: 'contabilidad',
        timestamps: false
    });

    AsientoContable.associate = (models) => {
        AsientoContable.hasMany(models.DetalleAsiento, { foreignKey: 'id_asiento_contable' });
    };

    return AsientoContable;
};