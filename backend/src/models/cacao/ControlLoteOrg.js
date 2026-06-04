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
        lote: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        ruta_compra: {
            type: DataTypes.STRING(250),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['RUTA 1-CAPO', 'RUTA 2-CAPO', 'RUTA 3-CAPO', 'RUTA 5-CAPO']],
                    msg: 'La ruta de compra seleccionada no es válida.'
                }
            }
        },
        cantidad_libra: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        costo: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        es_seco: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'control_lote_org',
        schema: 'cacao',
        timestamps: false
    });

    ControlLoteOrg.associate = (models) => {
        ControlLoteOrg.belongsTo(models.PeriodoCompra, { foreignKey: 'id_periodo_compra' });
        ControlLoteOrg.hasMany(models.LoteComercializacionOrg, { foreignKey: 'id_control_lote_org' });
    };

    return ControlLoteOrg;
};
