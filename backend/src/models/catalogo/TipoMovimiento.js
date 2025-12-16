export default (sequelize, DataTypes) => {
    const TipoMovimiento = sequelize.define('TipoMovimiento', {
        id_tipo_movimiento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipo_movimiento: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'tipo_movimiento',
        schema: 'catalogo',
        timestamps: false
    });

    TipoMovimiento.associate = (models) => {
        TipoMovimiento.hasMany(models.MovimientoInventario, { foreignKey: 'id_tipo_movimiento' });
    };

    return TipoMovimiento;
};