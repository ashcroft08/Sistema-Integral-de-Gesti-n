// ============================================
// models/configuracion/CertificadoDigital.js
// CORREGIDO - BLOB en lugar de BYTEA
// ============================================
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

// ============================================
// services/encryption.service.js
// ============================================
import crypto from 'crypto';

export class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        
        // Verificar que existe ENCRYPTION_KEY
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY no está configurada en .env');
        }

        // La key debe ser exactamente 32 bytes (64 caracteres hex)
        const keyHex = process.env.ENCRYPTION_KEY;
        if (keyHex.length !== 64) {
            throw new Error('ENCRYPTION_KEY debe tener 64 caracteres hexadecimales (32 bytes)');
        }

        this.key = Buffer.from(keyHex, 'hex');
    }

    /**
     * Encriptar buffer (certificado .p12)
     */
    encrypt(buffer) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        return { encrypted, iv };
    }

    /**
     * Desencriptar buffer
     */
    decrypt(encryptedBuffer, iv) {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted;
    }

    /**
     * Encriptar string (password)
     * Combina IV + encrypted en un solo string base64
     */
    encryptString(text) {
        const { encrypted, iv } = this.encrypt(Buffer.from(text, 'utf8'));
        return Buffer.concat([iv, encrypted]).toString('base64');
    }

    /**
     * Desencriptar string
     */
    decryptString(encryptedBase64) {
        const combined = Buffer.from(encryptedBase64, 'base64');
        const iv = combined.slice(0, 16);
        const encrypted = combined.slice(16);
        
        return this.decrypt(encrypted, iv).toString('utf8');
    }
}