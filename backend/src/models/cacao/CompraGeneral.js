export default (sequelize, DataTypes) => {
    const CompraGeneral = sequelize.define('CompraGeneral', {
        id_compra_general: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        numero: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        comunidad: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        codigo: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        proveedor: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        categoria: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        producto: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        valor_unitario: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        total: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        negociador: {
            type: DataTypes.STRING(250),
            allowNull: true
        }
    }, {
        tableName: 'compra_general',
        schema: 'cacao',
        timestamps: false
    });

    return CompraGeneral;
};
