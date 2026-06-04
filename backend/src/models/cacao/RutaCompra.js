export default (sequelize, DataTypes) => {
    const RutaCompra = sequelize.define('RutaCompra', {
        id_ruta_compra: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ruta_compra: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'ruta_compra',
        schema: 'cacao',
        timestamps: false
    });

    RutaCompra.associate = (models) => {
        // Associations removed as control_lote tables now store route as string
    };

    return RutaCompra;
};
