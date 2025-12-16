import { optional } from "zod";

export default (sequelize, DataTypes) => {
    const ConfiguracionToken = sequelize.define('ConfiguracionToken', {
        id_token: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tiempo_expiracion: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: 'configuracion_token',
        schema: 'configuracion',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    return ConfiguracionToken;
};