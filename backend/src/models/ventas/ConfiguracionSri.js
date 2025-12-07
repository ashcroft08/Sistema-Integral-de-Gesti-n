export default (sequelize, DataTypes) => {
    const ConfiguracionSri = sequelize.define('ConfiguracionSri', {
        id_configuracion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ambiente: {  // 1=Pruebas, 2=Producción
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        tipo_emision: {  // 1=Normal
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
        establecimiento: {  // 001
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: '001'
        },
        punto_emision: {  // 001
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
        // Certificado digital (.p12)
        certificado_path: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        certificado_password: {  // ⚠️ En producción, usar secrets manager
            type: DataTypes.STRING(255),
            allowNull: true
        },
        // URLs del SRI
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