export default (sequelize, DataTypes) => {
    const CertificadoDigital = sequelize.define('CertificadoDigital', {
        id_certificado: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_empresa: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Para multi-empresa/sucursal'
        },
        nombre: {
            type: DataTypes.STRING(200),
            allowNull: false,
            comment: 'Ej: "Certificado Matriz Quito 2024"'
        },
        // ✅ CORREGIDO: BLOB para PostgreSQL
        certificado_encriptado: {
            type: DataTypes.BLOB,
            allowNull: false,
            comment: 'Certificado .p12 encriptado con AES-256'
        },
        // ✅ CORREGIDO: BLOB para IV
        iv: {
            type: DataTypes.BLOB,
            allowNull: false,
            comment: 'IV usado en encriptación AES'
        },
        password_encriptado: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: 'Password del .p12 encriptado'
        },
        fecha_emision: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fecha_expiracion: {
            type: DataTypes.DATE,
            allowNull: false
        },
        emisor: {
            type: DataTypes.STRING(300),
            allowNull: true,
            comment: 'CN del certificado'
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        subido_por: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID del usuario que subió'
        }
    }, {
        tableName: 'certificado_digital',
        schema: 'configuracion',
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    CertificadoDigital.associate = (models) => {
        CertificadoDigital.belongsTo(models.Usuario, {
            foreignKey: 'subido_por',
            as: 'UsuarioSubio'
        });
    };

    return CertificadoDigital;
};