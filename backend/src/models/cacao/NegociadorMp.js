export default (sequelize, DataTypes) => {
    const NegociadorMp = sequelize.define('NegociadorMp', {
        id_negociador_mp: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        negociador: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'negociador_mp',
        schema: 'cacao',
        timestamps: false
    });

    NegociadorMp.associate = (models) => {
        NegociadorMp.hasMany(models.CompraInterna, { foreignKey: 'id_negociador_mp' });
    };

    return NegociadorMp;
};
