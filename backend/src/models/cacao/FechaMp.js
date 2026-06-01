export default (sequelize, DataTypes) => {
    const FechaMp = sequelize.define('FechaMp', {
        id_fecha_mp: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            unique: true
        },
        dia: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        mes: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        anio: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        trimestre: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            validate: {
                min: 1,
                max: 4
            }
        },
        nombre_mes: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        nombre_dia_semana: {
            type: DataTypes.STRING(15),
            allowNull: false
        }
    }, {
        tableName: 'fecha_mp',
        schema: 'cacao',
        timestamps: false
    });

    FechaMp.associate = (models) => {
        FechaMp.hasMany(models.CompraInterna, { foreignKey: 'id_fecha_compra' });
    };

    return FechaMp;
};
