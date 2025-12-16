export default (sequelize, DataTypes) => {
    const ConfiguracionSri = sequelize.define('ConfiguracionSri', {
        id_configuracion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ambiente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        tipo_emision: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        razon_social: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        nombre_comercial: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        ruc: {
            type: DataTypes.STRING(13),
            allowNull: false
        },
        establecimiento: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: '001'
        },
        punto_emision: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: '001'
        },
        direccion_matriz: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        obligado_contabilidad: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        contribuyente_especial: {
            type: DataTypes.STRING(5),
            allowNull: true
        },
        url_recepcion: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        url_autorizacion: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'configuracion_sri',
        schema: 'configuracion',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    return ConfiguracionSri;
};