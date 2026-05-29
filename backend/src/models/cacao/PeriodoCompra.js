export default (sequelize, DataTypes) => {
    const PeriodoCompra = sequelize.define('PeriodoCompra', {
        id_periodo_compra: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'periodo_compra',
        schema: 'cacao',
        timestamps: false
    });

    return PeriodoCompra;
};
