export default (sequelize, DataTypes) => {
    const LoteOrg = sequelize.define('LoteOrg', {
        id_lote_org: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lote_org: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'lote_org',
        schema: 'cacao',
        timestamps: false
    });

    LoteOrg.associate = (models) => {
        LoteOrg.hasMany(models.ControlLoteOrg, { foreignKey: 'id_lote_org' });
    };

    return LoteOrg;
};
