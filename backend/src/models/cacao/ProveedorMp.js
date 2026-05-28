export default (sequelize, DataTypes) => {
    const ProveedorMp = sequelize.define('ProveedorMp', {
        id_proveedor_mp: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        proveedor: {
            type: DataTypes.STRING(250),
            allowNull: false
        }
    }, {
        tableName: 'proveedor_mp',
        schema: 'cacao',
        timestamps: false
    });

    ProveedorMp.associate = (models) => {
        ProveedorMp.hasMany(models.CompraInterna, { foreignKey: 'id_proveedor_mp' });
    };

    return ProveedorMp;
};
