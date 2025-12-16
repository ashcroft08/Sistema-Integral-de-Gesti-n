// models/Descuento.js
export default (sequelize, DataTypes) => {
    const Descuento = sequelize.define('Descuento', {
        id_descuento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        descuento: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        porcentaje_descuento: {
            type: DataTypes.DECIMAL(5, 2), // Permite decimales ej. 12.50
            allowNull: false
        },
        codigo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'descuento',
        schema: 'ventas', // Lo ponemos en catálogo
        timestamps: false
    });

    Descuento.associate = (models) => {
        Descuento.hasMany(models.DetalleFactura, { foreignKey: 'id_descuento' });
    };

    return Descuento;
};