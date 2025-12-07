import { CertificateService } from '../services/certificate.service.js';
import multer from 'multer';

const certificateService = new CertificateService();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/x-pkcs12' || file.originalname.endsWith('.p12')) {
            cb(null, true);
        } else {
            cb(new Error('Solo archivos .p12 permitidos'));
        }
    }
});

export class CertificateController {

    async uploadCertificate(req, res) {
        try {
            const { password, nombre, id_empresa } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Archivo .p12 requerido'
                });
            }

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Password del certificado requerido'
                });
            }

            const result = await certificateService.uploadCertificate(
                file.buffer,
                password,
                { nombre, id_empresa },
                req.user.id_usuario
            );

            res.status(201).json({
                success: true,
                message: 'Certificado subido exitosamente',
                ...result
            });

        } catch (error) {
            console.error('Error uploading certificate:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async listCertificates(req, res) {
        try {
            const filters = req.query;
            const certificados = await certificateService.listCertificates(filters);

            res.status(200).json({
                success: true,
                certificados
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deactivateCertificate(req, res) {
        try {
            const { id } = req.params;
            await certificateService.deactivateCertificate(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Certificado desactivado'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async activateCertificate(req, res) {
        try {
            const { id } = req.params;
            await certificateService.activateCertificate(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Certificado activado'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Obtener info del certificado activo
     * GET /api/certificates/active
     */
    async getActiveCertificate(req, res) {
        try {
            const cert = await CertificadoDigital.findOne({
                where: { activo: true },
                order: [['fecha_expiracion', 'DESC']],
                attributes: [
                    'id_certificado',
                    'nombre',
                    'fecha_emision',
                    'fecha_expiracion',
                    'emisor',
                    'activo'
                ]
            });

            if (!cert) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay certificado activo',
                    alert: 'Sube un certificado desde el panel de gestión'
                });
            }

            const diasRestantes = Math.ceil(
                (cert.fecha_expiracion - new Date()) / (1000 * 60 * 60 * 24)
            );

            res.status(200).json({
                success: true,
                certificado: {
                    ...cert.toJSON(),
                    diasRestantes,
                    estado: diasRestantes < 0 ? 'expirado' :
                        diasRestantes < 30 ? 'por_expirar' : 'vigente'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export const uploadMiddleware = upload.single('certificado');