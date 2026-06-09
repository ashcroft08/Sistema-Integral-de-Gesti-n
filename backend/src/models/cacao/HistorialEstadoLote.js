export default (sequelize, DataTypes) => {
    const HistorialEstadoLote = sequelize.define('HistorialEstadoLote', {
        id_historial: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_control_lote: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tipo_lote: {
            type: DataTypes.STRING(3),
            allowNull: false,
            validate: {
                isIn: [['ORG', 'CV']]
            }
        },
        estado: {
            type: DataTypes.ENUM('ESCURRIDO', 'FERMENTADO', 'SECO', 'PRESECADO'),
            allowNull: false
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        observacion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        creado_en: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'historial_estado_lote',
        schema: 'cacao',
        timestamps: false
    });

    HistorialEstadoLote.associate = (models) => {
        HistorialEstadoLote.hasMany(models.PresecadoLote, { foreignKey: 'id_historial' });
    };

    return HistorialEstadoLote;
};
