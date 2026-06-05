export default (sequelize, DataTypes) => {
    const LoteComercializacionCv = sequelize.define('LoteComercializacionCv', {
        id_lote_comercializacion_cv: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_periodo_compra: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_control_lote_cv: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fecha_clasificacion: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        ass: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        as: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'as' // Escapa explícitamente el campo en la BD para evitar colisión con la palabra reservada 'as'
        },
        pajarito: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        impureza: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        porcentaje_perdida: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'lote_comercializacion_cv',
        schema: 'cacao',
        timestamps: false
    });

    LoteComercializacionCv.associate = (models) => {
        LoteComercializacionCv.belongsTo(models.ControlLoteCv, { foreignKey: 'id_control_lote_cv' });
        LoteComercializacionCv.belongsTo(models.PeriodoCompra, { foreignKey: 'id_periodo_compra' });
    };

    return LoteComercializacionCv;
};
