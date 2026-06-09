export default (sequelize, DataTypes) => {
    const ControlLoteOrg = sequelize.define('ControlLoteOrg', {
        id_control_lote_org: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_periodo_compra: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_ruta_compra: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        lote: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        fecha_ingreso: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        cantidad_libra: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        costo: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('ESCURRIDO', 'FERMENTADO', 'SECO', 'PRESECADO'),
            allowNull: false,
            defaultValue: 'ESCURRIDO'
        },
        clasificado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        odp: {
            type: DataTypes.STRING(250),
            allowNull: true
        }
    }, {
        tableName: 'control_lote_org',
        schema: 'cacao',
        timestamps: false
    });

    ControlLoteOrg.associate = (models) => {
        ControlLoteOrg.belongsTo(models.PeriodoCompra, { foreignKey: 'id_periodo_compra' });
        ControlLoteOrg.belongsTo(models.RutaCompra, { foreignKey: 'id_ruta_compra' });
        ControlLoteOrg.hasMany(models.LoteComercializacionOrg, { foreignKey: 'id_control_lote_org' });
    };

    return ControlLoteOrg;
};
