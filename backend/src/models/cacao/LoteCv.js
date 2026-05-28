export default (sequelize, DataTypes) => {
    const LoteCv = sequelize.define('LoteCv', {
        id_lote_cv: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lote_cv: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'lote_cv',
        schema: 'cacao',
        timestamps: false
    });

    LoteCv.associate = (models) => {
        LoteCv.hasMany(models.ControlLoteCv, { foreignKey: 'id_lote_cv' });
    };

    return LoteCv;
};
