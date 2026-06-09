export default (sequelize, DataTypes) => {
    const PresecadoLote = sequelize.define('PresecadoLote', {
        id_presecado: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_control_lote: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_historial: {
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
        nro_ciclo: {
            type: DataTypes.SMALLINT,
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
        peso_antes: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        peso_despues: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        perdida_libras: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        porcentaje_libras: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
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
        tableName: 'presecado_lote',
        schema: 'cacao',
        timestamps: false
    });

    PresecadoLote.associate = (models) => {
        PresecadoLote.belongsTo(models.HistorialEstadoLote, { foreignKey: 'id_historial' });
    };

    return PresecadoLote;
};
