export default (sequelize, DataTypes) => {
    const CompraExterna = sequelize.define('CompraExterna', {
        id_compra_externa: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        nombres: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        peso_proveedor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        peso_diferencia: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        quintales_facturas: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        costo_unitario: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        total: {
            type: DataTypes.DECIMAL(12, 4),
            allowNull: true
        },
        peso_ass: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        peso_as: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        peso_pajarito: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        peso_basura: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        total_qq: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        libras_seco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        libras_escurrido: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        quintales_escurrido: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        es_organico: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        id_periodo_compra: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'compra_externa',
        schema: 'cacao',
        timestamps: false
    });

    CompraExterna.associate = (models) => {
        CompraExterna.belongsTo(models.PeriodoCompra, { foreignKey: 'id_periodo_compra' });
    };

    return CompraExterna;
};
