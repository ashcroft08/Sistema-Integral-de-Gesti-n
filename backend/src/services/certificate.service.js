import { CertificadoDigital } from '../models/index.js';
import { EncryptionService } from './encryption.service.js';
import forge from 'node-forge';

export class CertificateService {
    constructor() {
        this.encryption = new EncryptionService();
    }

    async uploadCertificate(fileBuffer, password, metadata, userId) {
        try {
            // 1. Validar certificado
            const certInfo = await this._validateP12(fileBuffer, password);

            // 2. Encriptar certificado
            const { encrypted: certEncrypted, iv: certIv } = this.encryption.encrypt(fileBuffer);

            // 3. Encriptar password
            const passwordEncrypted = this.encryption.encryptString(password);

            // 4. Guardar en BD
            const certificado = await CertificadoDigital.create({
                nombre: metadata.nombre || `Certificado ${certInfo.commonName}`,
                id_empresa: metadata.id_empresa || null,
                certificado_encriptado: certEncrypted,
                iv: certIv,
                password_encriptado: passwordEncrypted,
                fecha_emision: certInfo.notBefore,
                fecha_expiracion: certInfo.notAfter,
                emisor: certInfo.issuer,
                subido_por: userId
            });

            return {
                success: true,
                certificado: {
                    id: certificado.id_certificado,
                    nombre: certificado.nombre,
                    expira: certificado.fecha_expiracion,
                    diasRestantes: this._getDaysUntilExpiry(certificado.fecha_expiracion)
                }
            };

        } catch (error) {
            throw new Error(`Error guardando certificado: ${error.message}`);
        }
    }

    async getCertificateForSigning(idCertificado) {
        const cert = await CertificadoDigital.findByPk(idCertificado);

        if (!cert || !cert.activo) {
            throw new Error('Certificado no encontrado o inactivo');
        }

        if (new Date() > cert.fecha_expiracion) {
            throw new Error('Certificado expirado');
        }

        // Desencriptar certificado
        const p12Buffer = this.encryption.decrypt(
            cert.certificado_encriptado,
            cert.iv
        );

        // Desencriptar password
        const password = this.encryption.decryptString(cert.password_encriptado);

        return { p12Buffer, password };
    }

    async _validateP12(p12Buffer, password) {
        try {
            const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const cert = certBags[forge.pki.oids.certBag][0].cert;

            return {
                commonName: cert.subject.getField('CN').value,
                issuer: cert.issuer.getField('CN').value,
                notBefore: new Date(cert.validity.notBefore),
                notAfter: new Date(cert.validity.notAfter)
            };
        } catch (error) {
            throw new Error('Certificado o password inválido');
        }
    }

    async listCertificates(filters = {}) {
        const where = {};

        if (filters.id_empresa) {
            where.id_empresa = filters.id_empresa;
        }

        const certificados = await CertificadoDigital.findAll({
            where,
            attributes: [
                'id_certificado',
                'nombre',
                'fecha_emision',
                'fecha_expiracion',
                'emisor',
                'activo'
            ],
            order: [['fecha_expiracion', 'DESC']]
        });

        return certificados.map(cert => ({
            ...cert.toJSON(),
            diasRestantes: this._getDaysUntilExpiry(cert.fecha_expiracion),
            estado: this._getCertificateStatus(cert.fecha_expiracion)
        }));
    }

    async deactivateCertificate(idCertificado) {
        await CertificadoDigital.update(
            { activo: false },
            { where: { id_certificado: idCertificado } }
        );
    }

    async activateCertificate(idCertificado) {
        // Verificar que no esté expirado
        const cert = await CertificadoDigital.findByPk(idCertificado);
        
        if (!cert) {
            throw new Error('Certificado no encontrado');
        }

        if (new Date() > cert.fecha_expiracion) {
            throw new Error('No se puede activar un certificado expirado');
        }

        await CertificadoDigital.update(
            { activo: true },
            { where: { id_certificado: idCertificado } }
        );
    }

    _getDaysUntilExpiry(expirationDate) {
        const now = new Date();
        const expiry = new Date(expirationDate);
        const diffTime = expiry - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    _getCertificateStatus(expirationDate) {
        const days = this._getDaysUntilExpiry(expirationDate);

        if (days < 0) return 'expirado';
        if (days < 30) return 'por_expirar';
        return 'vigente';
    }
}