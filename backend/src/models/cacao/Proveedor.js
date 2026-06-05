export default (sequelize, DataTypes) => {
    const Proveedor = sequelize.define('Proveedor', {
        id_proveedor: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombres: {
            type: DataTypes.STRING(250),
            allowNull: false
        },
        direccion: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        identificacion: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        correo: {
            type: DataTypes.STRING(250),
            allowNull: true
        }
    }, {
        tableName: 'proveedor',
        schema: 'cacao',
        timestamps: false
    });

    Proveedor.associate = (models) => {
        Proveedor.hasMany(models.CompraExterna, { foreignKey: 'id_proveedor' });
    };

    return Proveedor;
};
