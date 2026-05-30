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
        trimestre: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 4
            }
        },
        anio: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'PENDIENTE',
            validate: {
                isIn: [['PENDIENTE', 'APROBADO']]
            }
        }
    }, {
        tableName: 'periodo_compra',
        schema: 'cacao',
        timestamps: false
    });

    return PeriodoCompra;
};
